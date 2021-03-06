app.register.controller("VListCtrl", function ($scope) {
    fillVisitList();
    if (document.getElementById("spinner") !== null) {
        document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
    if (typeof videoStream !== 'undefined') {
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
        imgEl.src = image;
        const fName = document.createElement("input");
        fName.id = "f-name-" + label;
        fName.placeholder = firstName || label;
        const lName = document.createElement("input");
        lName.id = "l-name-" + label;
        lName.placeholder = lastName || "score: " + score;
        const deleteVisitButton = document.createElement("button");
        deleteVisitButton.className = "btn btn-outline-danger";
        deleteVisitButton.innerHTML = "&#10006";
        const acceptVisitButton = document.createElement("button");
        acceptVisitButton.id = label;
        acceptVisitButton.className = "btn btn-outline-success btn-accept-user";
        acceptVisitButton.innerHTML = "&#10004;&#65039;";
        visitListcontainer.appendChild(col);
        col.appendChild(imgEl);
        col.appendChild(fName);
        col.appendChild(lName);
        col.appendChild(document.createElement("br"));
        col.appendChild(deleteVisitButton);
        col.appendChild(acceptVisitButton);
        acceptVisitButton.onclick = () => {

            const usr = JSON.parse(localStorage.getItem(label));
            localStorage.removeItem(label);
            const _fName = document.getElementById("f-name-" + label).value || firstName;
            const _lName = document.getElementById("l-name-" + label).value || lastName;
            const _label = _fName + " " + _lName;
            localStorage.setItem(_label, JSON.stringify({
                image: usr.image,
                descriptor: usr.descriptor,
                score: usr.score,
                firstName: _fName,
                lastName: _lName,
            }));

        }
        deleteVisitButton.onclick = () => {
            localStorage.removeItem(label);
            location.reload();
            fillVisitList();
        };
        col.appendChild;
    }
}

