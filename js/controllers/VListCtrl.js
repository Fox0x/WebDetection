app.register.controller("VListCtrl", function ($scope) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded");
  } else {
    fillVisitList();
    if (document.getElementById("spinner") !== null) {
      document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
  }
});

function fillVisitList() {
  console.log("fill visit list");
  for (let i = 0; i < users.length + 1; i++) {
    const visitListcontainer = document.getElementById("visitList");
    const row = document.createElement("div");
    row.className = "row";
    const col = document.createElement("div");
    col.className = "col";
    const imgEl = document.createElement("img");
    imgEl.id = imageList[i].label;
    imgEl.src = imageList[i].image;
    imgEl.alt = imageList[i].score;
    const firstName = document.createElement("input");
    firstName.id = "vl_fName" + (i + 1);
    firstName.placeholder = imageList[i].label;
    const lastName = document.createElement("input");
    lastName.id = "vl_lName" + (i + 1);

    visitListcontainer.appendChild(row);
    row.appendChild(col);
    col.appendChild(imgEl);
    col.appendChild(firstName);
    col.appendChild(document.createElement("br"));
    col.appendChild(lastName);
  }
}