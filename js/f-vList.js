app.register.controller("VListCtrl", function ($scope) {
  fillVisitList();
  if (document.getElementById("spinner") !== null) {
    document.getElementById("spinner").style.visibility = "hidden";
  }
  document.getElementById("content").style.visibility = "visible";
  if (videoStream) {
    video.pause();
    videoStream.getVideoTracks()[0].stop();
  }
});
function fillVisitList() {
  console.log("fill visit list");
  for (let key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) {
      continue; // пропустит такие ключи, как "setItem", "getItem" и так далее
    }
    const person = JSON.parse(localStorage.getItem(key));

    createNewVisit(
      person.image,
      person.score,
      person.firstName,
      person.lastName,
      key
    );
  }

  function createNewVisit(image, score, firstName, lastName, label) {
    const visitListcontainer = document.getElementById("visitList");
    const col = document.createElement("div");
    col.className = "col-2 m-3 p-0";

    const imgEl = document.createElement("img");
    imgEl.id = label;
    imgEl.src = image;
    imgEl.alt = score;
    const fName = document.createElement("input");
    fName.placeholder = firstName || label;
    const lName = document.createElement("input");
    lName.placeholder = lastName || "score: " + score.toFixed(2);
    const deleteVisitButton = document.createElement("button");
    deleteVisitButton.className = "btn btn-outline-danger";
    deleteVisitButton.innerHTML = "&#10006";
    const acceptVisitButton = document.createElement("button");
    acceptVisitButton.className = "btn btn-outline-success";
    acceptVisitButton.innerHTML = "&#10004;&#65039;";
    visitListcontainer.appendChild(col);
    col.appendChild(imgEl);
    col.appendChild(fName);
    col.appendChild(lName);
    col.appendChild(document.createElement("br"));
    col.appendChild(deleteVisitButton);
    col.appendChild(acceptVisitButton);
    deleteVisitButton.onclick = function (event) {
      localStorage.removeItem(label);
      location.reload();
      fillVisitList();
    };
    col.appendChild;
  }
}
