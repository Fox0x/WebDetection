app.register.controller("VListCtrl", function ($scope) {
  fillVisitList();
  if (document.getElementById("spinner") !== null) {
    document.getElementById("spinner").style.visibility = "hidden";
  }
  document.getElementById("content").style.visibility = "visible";
  	  // Пауза
  video.pause();
  // Стоп
  videoStream.getVideoTracks()[0].stop();
});



function fillVisitList() {
  console.log("fill visit list");
  for (let i = 0; i < localStorage.length; i++) {
    const person = JSON.parse(localStorage.getItem("person " + (i + 1)));
    createNewVisit(
      person.image,
      person.score,
      person.firstName,
      person.lastName,
      person.created,
      "person " + (i + 1),
    );
  }

  function createNewVisit(image, score, firstName, lastName, created, label) {
    const visitListcontainer = document.getElementById("visitList");
    const row = document.createElement("div");
    row.className = "row";
    const col = document.createElement("div");
    col.className = "col";
    const imgEl = document.createElement("img");
    imgEl.id = label;
    imgEl.src = image;
    imgEl.alt = score;
    const fName = document.createElement("input");
    fName.placeholder = firstName || label;
    const lName = document.createElement("input");
    lName.placeholder = lastName || created;

    visitListcontainer.appendChild(row);
    row.appendChild(col);
    col.appendChild(imgEl);
    col.appendChild(fName);
    col.appendChild(lName);
  }
}
