app.register.controller("SListCtrl", function ($scope) {
    fillSubjectList();
    if (document.getElementById("spinner") !== null) {
        document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
    if (typeof videoStream !== 'undefined') {
        video.pause();
        videoStream.getVideoTracks()[0].stop();
    }
});

function fillSubjectList() {
    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) {
            continue; // пропустит такие ключи, как "setItem", "getItem" и так далее
        }
        const person = JSON.parse(localStorage.getItem(key));

        createNewSubject(
            person.image,
            person.score,
            person.firstName,
            person.lastName,
            key
        );
    }

    function createNewSubject(image, score, firstName, lastName, label) {
        const subjectListcontainer = document.getElementById("subjectList");
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
        const deleteSubjectButton = document.createElement("button");
        deleteSubjectButton.className = "btn btn-outline-danger";
        deleteSubjectButton.innerHTML = "&#10006";
        const acceptSubjectButton = document.createElement("button");
        acceptSubjectButton.className = "btn btn-outline-success btn-accept-user";
        acceptSubjectButton.innerHTML = "&#10004;&#65039;";
        subjectListcontainer.appendChild(col);
        col.appendChild(imgEl);
        col.appendChild(fName);
        col.appendChild(lName);
        col.appendChild(document.createElement("br"));
        col.appendChild(deleteSubjectButton);
        col.appendChild(acceptSubjectButton);
        acceptSubjectButton.onclick = () => {

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

        deleteSubjectButton.onclick = () => {
            localStorage.removeItem(label);
            location.reload();
            fillSubjectList();
        };
        col.appendChild;
    }
}

