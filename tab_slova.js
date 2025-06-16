export const tableSlova = () => {
const table = document.createElement("table");

document.querySelector("[data-slova]").append(table);
  for (let row = 0; row < 6; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 5; col++) {
        const td = document.createElement("td");
        td.id = `stroka${row+1}-bukva${col+1}`;
        td.textContent = "";
        tr.append(td);
    }
    table.append(tr);
  }
};

export const tableSlovaClear = () => {
  for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).classList.remove("bukvax");
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).classList.remove("bukva");
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).textContent = "";
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).classList.remove("bukvagray");
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).classList.remove("bukvayellow");
        document.querySelector(`#stroka${row+1}-bukva${col+1}`).classList.remove("bukvagreen");
     }
   }
};

export const tableKlavaClear = () => {
  for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 11; col++) {
        document.querySelector(`#row${row+1}-col${col+1}`).classList.remove("bukvagray");
        document.querySelector(`#row${row+1}-col${col+1}`).classList.remove("bukvayellow");
        document.querySelector(`#row${row+1}-col${col+1}`).classList.remove("bukvagreen");
     }
   }
};