app.register.controller("VListCtrl", function ($scope) {
  fillVisitList();
  if (document.getElementById("spinner") !== null) {
    document.getElementById("spinner").style.visibility = "hidden";
  }
  document.getElementById("content").style.visibility = "visible";
  // video.pause();
  // videoStream.getVideoTracks()[0].stop();
});
function fillVisitList() {
  console.log("fill visit list");
  for(let key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) {
      continue; // пропустит такие ключи, как "setItem", "getItem" и так далее
    }
    const person = JSON.parse(localStorage.getItem(key));
    
      createNewVisit(
        person.image,
        person.score,
        person.firstName,
        person.lastName,
        person.created,
        key,
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
    const deleteVisitButton = document.createElement("button");
    deleteVisitButton.className = "btn btn-danger ";
    deleteVisitButton.innerHTML = "&#10006";
    visitListcontainer.appendChild(row);
    row.appendChild(col);
    col.appendChild(imgEl);
    col.appendChild(fName);
    col.appendChild(lName);
    col.appendChild(deleteVisitButton);
    deleteVisitButton.onclick = function (event) {
      localStorage.removeItem(label);
      location.reload();
      fillVisitList();
    }
  }
}