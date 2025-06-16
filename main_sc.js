import { slovaSlovar } from "./slovar.js";
import { slovaSlovarSimple } from "./simple_slovar.js";
import { slovaSlovarProverka } from "./slovar_proverka.js";
import { tableSlova } from "./tab_slova.js";
import { tableSlovaClear, tableKlavaClear } from "./tab_slova.js";

const stylesGreen = "background-color:rgb(100, 211, 104); color: black; padding: 7px";

let vvodSlovo = "", nomerStroki = 1, timer = "", resultMessage = "", blockInput = false, shift = -17, interval;

const popupOverlay = document.getElementById('popup-overlay');
const popupOverlayText = document.getElementById('popup-overlay-text');
const popupOverlaySet = document.getElementById('popup-overlay-set');
const popupOverlayStat = document.getElementById('popup-overlay-stat');
const popupOverlayResult = document.getElementById('popup-overlay-result');

let slovoList = JSON.parse(localStorage.getItem("slovoList_KEY")) || [];
let isCheked = JSON.parse(localStorage.getItem("isChecket_KEY")) || false;
let isSlovar = JSON.parse(localStorage.getItem("isSlovar_KEY")) || false;
let timerStart = JSON.parse(localStorage.getItem("timerS_KEY")) || 0;
let isBackgr = JSON.parse(localStorage.getItem("isBackgr_KEY")) || false;
let zagadannoeSlovo = JSON.parse(localStorage.getItem("zagadannoeslovo_KEY")) || "";
let statistic = JSON.parse(localStorage.getItem("statistic_KEY")) || [];

document.querySelector("#statchek").checked = false;
if (zagadannoeSlovo !== "") {
    zagadannoeSlovo = caesarCipher((zagadannoeSlovo), -shift);
}
if (isBackgr) {
    document.querySelector("#backgr").checked = true;
}
if (isSlovar) {
    document.querySelector("#slovarchek").checked = true;
}
if (isCheked) {
    document.querySelector("#timerchek").checked = true;
    if (timerStart !== 0) {
        clearInterval(interval);
        interval = setInterval(renderTimer, 500);
    }
}

tableSlova();

// рисуем клавиатуру
const keyboard = [
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х"],
    ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
    ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "ъ", "⌫"]
];
const table = document.createElement("table");
const tableDraw = (tab) => {
    document.querySelector("[data-keyboard]").append(tab);
    for (let row = 0; row < 3; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < 11; col++) {
            const td = document.createElement("td");
            td.id = `row${row + 1}-col${col + 1}`;
            td.textContent = keyboard[row][col];
            td.classList.add("keyboard");
            tr.append(td);
        }
        tab.append(tr);
    }
}
tableDraw(table);

// загружаем данные из хранилища
for (let i = 0; i < slovoList.length; i++) {
    vvodSlovo = slovoList[i];
    nomerStroki = i + 1;
    for (let j = 0; j < 5; j++) {
        document.querySelector(`#stroka${nomerStroki}-bukva${j + 1}`).textContent = vvodSlovo[j];
    }
    krasimPoleVvoda(vvodSlovo, zagadannoeSlovo.replaceAll("ё", "е"), nomerStroki, i);
    vvodSlovo = "";
    nomerStroki++;
}

// обрабатываем нажатие кнопок на клавиатуре
table.addEventListener("click", (e) => {
    if (!blockInput) {
        if (e.target.tagName === "TD") {
            if (timerStart === 0) {
                timerStart = Date.now();
                localStorage.setItem("timerS_KEY", JSON.stringify(timerStart));
                zagadannoeSlovo = zagadannoeSlovoFn(slovaSlovar);
                //console.log("%c" + zagadannoeSlovo, stylesGreen);
                if (document.querySelector("#timerchek").checked === true) {
                    clearInterval(interval);
                    interval = setInterval(renderTimer, 500);
                }
            }
            e.target.classList.add("keypressed");
            setTimeout(() => e.target.classList.remove("keypressed"), 150);
            if (e.target.textContent === "⌫") {
                if (vvodSlovo.length > 0) {
                    resultMessage = `#stroka${nomerStroki}-bukva${vvodSlovo.length}`;
                    document.querySelector(resultMessage).classList.remove("bukva");
                    document.querySelector(resultMessage).textContent = "";
                    vvodSlovo = vvodSlovo.slice(0, vvodSlovo.length - 1);
                }
            } else {
                vvodSlovo += e.target.textContent;
                resultMessage = `#stroka${nomerStroki}-bukva${vvodSlovo.length}`;
                document.querySelector(resultMessage).classList.add("bukva");
                document.querySelector(resultMessage).textContent = e.target.textContent;
                // ввели слово из 5 букв
                if (vvodSlovo.length === 5) {
                    if (!ProverkaSovpadeniySoSlovarem(vvodSlovo)) {
                        displayMessage("Слова нет в словаре<br>очищаем поле ввода");
                        setTimeout(() => clearString(), 1800);
                        setTimeout(() => clearMessage(), 2000);
                    } else {
                        krasimPoleVvoda(vvodSlovo, zagadannoeSlovo.replaceAll("ё", "е"), nomerStroki, 0);
                        // добавляем слово в хранилише
                        slovoList.push(vvodSlovo);
                        localStorage.setItem("slovoList_KEY", JSON.stringify(slovoList));
                        // итоговая проверка
                        if (vvodSlovo === zagadannoeSlovo.replaceAll("ё", "е")) {
                            if (document.querySelector("#timerchek").checked) {
                                resultMessage = `Вы победили !<br>Загаданное слово:<br><b class="bukvagreen bukvames">${zagadannoeSlovo}</b><br>Справились за ${timer}<hr>`;
                            } else {
                                resultMessage = `Вы победили !<br>Загаданное слово:<br><b class="bukvagreen bukvames">${zagadannoeSlovo}</b><hr>`;
                            }
                            pushStatistic(true);
                            clearVarAndTable(resultMessage);
                        } else if (nomerStroki >= 6) {
                            resultMessage = `Слово не разгадано!<br>Загаданное слово:<br><b class="bukvayellow bukvames">${zagadannoeSlovo}</b><hr>`;
                            pushStatistic(false);
                            clearVarAndTable(resultMessage);
                        }
                        nomerStroki++;
                        vvodSlovo = "";
                    }
                }
            }
        }
    }
});

// наведение курсора на кнопку клавиатуры
table.addEventListener("pointerover", (e) => {
    if (e.target.tagName === "TD") {
        e.target.classList.add("pointeren");
    }
});

table.addEventListener("pointerout", (e) => {
    if (e.target.tagName === "TD") {
        e.target.classList.remove("pointeren");
    }
});

// кнопа помощь
document.querySelector("#help").addEventListener("click", () => {
    displayText(popupOverlayText);
});

document.querySelector("#closehelp").addEventListener("click", () => {
    clearText(popupOverlayText);
});

// кнопа настройки
document.querySelector("#settings").addEventListener("click", () => {
    displayText(popupOverlaySet);
});

document.querySelector("#closeset").addEventListener("click", () => {
    clearText(popupOverlaySet);
});

// Статистика 
document.querySelector("#timer").addEventListener("click", () => {
    let numberGame = 0, successGame = 0, middleIteration = 0, currentSeries = 0, bestSeries = 0, j = 0, bestTime = "00:00";
    for (let i = 0; i < statistic.length; i++) {
        if ((bestTime === "00:00") && statistic[i].isVictoty) {
            bestTime = statistic[i].time;
        };
        if (statistic[i].isVictoty) {
            successGame++;
            j++;
            if (j > bestSeries) {
                bestSeries = j;
            }
        } else {
            j = 0;
        };
        if ((bestTime > statistic[i].time) && statistic[i].isVictoty) {
            bestTime = statistic[i].time;
        };
        middleIteration = middleIteration + statistic[i].iteration;
    }
    j = statistic.length;
    while (j > 0) {
        if (statistic[j - 1].isVictoty) {
            currentSeries++;
        } else {
            j = 1;
        }
        j--;
    }
    if (statistic.length > 1) {
        middleIteration = middleIteration / statistic.length;
    };
    numberGame = statistic.length;
    document.querySelector("#popup-stat-body").innerHTML = `Всего игр: ${numberGame}<br>Побед всего: ${successGame}<br>Лучшая серия: ${bestSeries}<br>Побед сейчас: ${currentSeries}<br>Попыток на игру (среднее): ${middleIteration.toFixed(2)}<br>Лучшее время: ${bestTime} <hr>`;
    displayText(popupOverlayStat);
});

document.querySelector("#closestat").addEventListener("click", () => {
    clearText(popupOverlayStat);
});

// Итог игры
function displayResult(resultMessage) {
    document.querySelector("#popup-result-body").innerHTML = resultMessage;
    displayText(popupOverlayResult);
}

document.querySelector("#closeresult").addEventListener("click", () => {
    clearText(popupOverlayResult);
    tableSlovaClear();
    tableKlavaClear();
    blockInput = false;
});

// check box нельзя включить после начала игры
document.querySelector("#timerchek").addEventListener("change", () => {
    if (timerStart > 0) {
        if (document.querySelector("#timerchek").checked) {
            document.querySelector("#timerchek").checked = false;
        } else {
            document.querySelector("#timerchek").checked = true;
        }
    } else {
        localStorage.setItem("isChecket_KEY", JSON.stringify(document.querySelector("#timerchek").checked));
    }
});

// check словарь
document.querySelector("#slovarchek").addEventListener("change", () => {
    localStorage.setItem("isSlovar_KEY", JSON.stringify(document.querySelector("#slovarchek").checked));
});

// check box фон
document.querySelector("#backgr").addEventListener("change", () => {
    localStorage.setItem("isBackgr_KEY", JSON.stringify(document.querySelector("#backgr").checked));
});

// сбросить статистику
document.querySelector("#resetstat").addEventListener("click", () => {
    if (document.querySelector("#statchek").checked) {
        statistic = [];
        localStorage.setItem("statistic_KEY", JSON.stringify(statistic));
        document.querySelector("#statchek").checked = false;
        clearText(popupOverlaySet);
        displayMessage("Статистика удалена");
        setTimeout(() => clearMessage(), 1500);
    }
});

// загадываем слово
function zagadannoeSlovoFn(slovaSlovar) {
    let Slovo1;
    if (document.querySelector("#slovarchek").checked === false) {
        Slovo1 = slovaSlovarSimple[Math.floor(Math.random() * slovaSlovarSimple.length)];
    }
    else {
        Slovo1 = slovaSlovar[Math.floor(Math.random() * slovaSlovar.length)];
    }
    localStorage.setItem("zagadannoeslovo_KEY", JSON.stringify(caesarCipher(Slovo1, shift)));
    return Slovo1;
};

// проверка введённого слова на наличие в словарях с учётом буквы ё
function ProverkaSovpadeniySoSlovarem(vvodSlovo) {
    for (let i = 0; i < slovaSlovarSimple.length; i++) {
        if (slovaSlovarSimple[i].replaceAll("ё", "е") === vvodSlovo) { return true; }
    }
    for (let i = 0; i < slovaSlovar.length; i++) {
        if (slovaSlovar[i].replaceAll("ё", "е") === vvodSlovo) { return true; }
    }
    for (let i = 0; i < slovaSlovarProverka.length; i++) {
        if (slovaSlovarProverka[i].replaceAll("ё", "е") === vvodSlovo) { return true; }
    }
    return false;
}

// окрашиваем буквы на клавиатуре и в строке ввода
function krasimPoleVvoda(vvodSlovo, zagadannoeSlovo, nomerStroki, lij) {

    let slovoColor = [
        { bukva: '', nomer: 0, nomerG: 0, nomerY: 0, col: 'bukvagray' },
        { bukva: '', nomer: 0, nomerG: 0, nomerY: 0, col: 'bukvagray' },
        { bukva: '', nomer: 0, nomerG: 0, nomerY: 0, col: 'bukvagray' },
        { bukva: '', nomer: 0, nomerG: 0, nomerY: 0, col: 'bukvagray' },
        { bukva: '', nomer: 0, nomerG: 0, nomerY: 0, col: 'bukvagray' },
    ];
    for (let k = 0; k < 5; k++) {
        for (let j = 0; j < 5; j++) {
            if (vvodSlovo[k] === zagadannoeSlovo[j]) {
                slovoColor[k].bukva = vvodSlovo[k];
                slovoColor[k].nomer++;
                if (k === j) {
                    slovoColor[j].col = "bukvagreen";
                    slovoColor[k].nomerG++;
                }
            }
        }
    };
    for (let i = 0; i < 5; i++) {
        for (let l = 0; l < 5; l++) {
            if (((slovoColor[i].col === "bukvagreen") || (slovoColor[l].col === "bukvagreen")) && (slovoColor[i].bukva === slovoColor[l].bukva) && (i !== l)) {
                slovoColor[l].nomerG++;
            }
        }
    };
    for (let i = 0; i < 5; i++) {
        slovoColor[i].nomerY = slovoColor[i].nomer - slovoColor[i].nomerG;
        if ((slovoColor[i].nomerY > 0) && (slovoColor[i].nomerG === 0)) slovoColor[i].col = "bukvayellow";
    }
    for (let i = 0; i < 5; i++) {
        setTimeout(() => document.querySelector(`#stroka${nomerStroki}-bukva${i + 1}`).classList.add(slovoColor[i].col), 350 + i * 150 + lij * 150);
        setTimeout(() => document.querySelector(`#stroka${nomerStroki}-bukva${i + 1}`).classList.add("bukvax"), 150 + i * 150 + lij * 150);
        colorLetter(i, slovoColor[i].col);
    }
}

// красим буквы на клаве
function colorLetter(item, color) {
    for (const elem of table.querySelectorAll("*")) {
        if (elem.textContent === vvodSlovo[item]) {
            switch (color) {
                case "bukvagreen":
                    elem.classList.remove("bukvayellow");
                    elem.classList.remove("bukvagray");
                    elem.classList.add(color);
                    break;
                case "bukvayellow":
                    if (!elem.classList.contains("bukvagreen")) {
                        elem.classList.remove("bukvagray");
                        elem.classList.add(color);
                    }
                    break;
                case "bukvagray":
                    if (!(elem.classList.contains("bukvagreen") || elem.classList.contains("bukvayellow"))) {
                        elem.classList.add(color);
                    }
                    break;
            }
        }
    }
};

// сохраняем статистику
function pushStatistic(key) {
    const statisticGame = {
        isVictoty: key,
        slovo: zagadannoeSlovo,
        iteration: nomerStroki,
        time: timeGame(),
    };
    statistic.push(statisticGame);
    localStorage.setItem("statistic_KEY", JSON.stringify(statistic));
};

// время с начала игры (не больше 60 минут)
function timeGame() {
    if ((Date.now() - timerStart) < 3600000) {
        return Intl.DateTimeFormat("ru-RU", {
            minute: 'numeric',
            second: 'numeric',
        }).format(Date.now() - timerStart);
    } else {
        return "99:99";
    }
};

function renderTimer() {
    timer = timeGame();
    document.querySelector("#timer").textContent = ` ВРЕМЯ ${timer} `;
};

// выводим помощь
function displayText(text) {
    text.style.display = 'block';
};

// стираем помощь
function clearText(text) {
    text.style.display = 'none';
};

// выводим сообщение
function displayMessage(text) {
    popupOverlay.style.display = 'block';
    document.querySelector("#popup").innerHTML = text;
};

// стираем сообщение
function clearMessage() {
    popupOverlay.style.display = 'none';
    document.querySelector("#popup").textContent = "";
};

// очищаем строку
function clearString() {
    for (let i = 1; i <= 5; i++) {
        document.querySelector(`#stroka${nomerStroki}-bukva${i}`).classList.remove("bukva");
        document.querySelector(`#stroka${nomerStroki}-bukva${i}`).textContent = "";
    }
    vvodSlovo = "";
}

// очищаем переменные и хранилище
function clearVar() {
    blockInput = true;
    nomerStroki = 0;
    vvodSlovo = "";
    timerStart = 0;
    document.querySelector("#timer").innerHTML = "&nbsp; &nbsp; &nbsp;ВОРДЛИ&nbsp; &nbsp; &nbsp;";
    slovoList = [];
    localStorage.setItem("slovoList_KEY", JSON.stringify(slovoList));
    localStorage.setItem("timerS_KEY", JSON.stringify(timerStart));
    clearInterval(interval);
    zagadannoeSlovo = "";
    localStorage.setItem("zagadannoeslovo_KEY", JSON.stringify(zagadannoeSlovo));
}

// выводим результат игры, очищаем переменные и стили в таблицах
function clearVarAndTable(resultMessage) {
    clearVar();
    setTimeout(() => displayResult(resultMessage), 1500);
};

// шифрование загаданного слова для хранилища
function caesarCipher(text, shift) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i), shiftedCode;
        if (shift > 0) {
            shiftedCode = code + shift + i;
        }
        else {
            shiftedCode = code + shift - i;
        }
        let char = String.fromCharCode(shiftedCode);
        result += char;
    }
    return result;
}

// Параллакс эффект при движении мыши
let bg = document.querySelector('.mouse-parallax-bg');
window.addEventListener('mousemove', function (e) {
    if (!(document.querySelector("#backgr").checked === true)) {
        let x = e.clientX / window.innerWidth;
        let y = e.clientY / window.innerHeight;
        bg.style.transform = 'translate(-' + x * 50 + 'px, -' + y * 50 + 'px)';
    }
});