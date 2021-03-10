app.register.controller("SListCtrl", function () {

    if (document.getElementById("spinner") !== null) {
        document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
    if (typeof videoStream !== 'undefined') {
        video.pause();
        videoStream.getVideoTracks()[0].stop();
    }
    if (localStorage.length) {
        fillSubjectList();
    } else {
        new bootstrap.Modal(document.getElementById("emptySubjectAlertModal"), {}).show();
    }
});

function fillSubjectList() {
    const users = JSON.parse(localStorage.users);
    users.forEach(user => createNewSubject(user.image, user.score, user.firstName, user.lastName, user.label, user.created))

    function createNewSubject(image, score, firstName, lastName, label, timestamp) {
        const subjectListcontainer = document.getElementById("subjectList");
        const col = document.createElement("div");
        col.className = "col-2 m-3 p-0";

        const imgEl = document.createElement("img");
        imgEl.src = image;
        const fName = document.createElement("input");
        fName.id = "f-name-" + label;
        fName.placeholder = firstName || timestamp;
        const lName = document.createElement("input");
        lName.id = "l-name-" + label;
        lName.placeholder = lastName || "score: " + score;
        const deleteSubjectButton = document.createElement("button");
        deleteSubjectButton.id = "delete-" + label;
        deleteSubjectButton.className = "btn btn-outline-danger";
        deleteSubjectButton.innerHTML = "&#10006";
        const acceptSubjectButton = document.createElement("button");
        acceptSubjectButton.id = "accept-" + label;
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

            const fName = document.getElementById("f-name-" + label).value,
                fName_ph = document.getElementById("f-name-" + label).getAttribute("placeholder");
            users.find(user => user.label === label).firstName = fName || fName_ph;

            const lName = document.getElementById("l-name-" + label).value,
                lName_ph = document.getElementById("l-name-" + label).getAttribute("placeholder");
            users.find(user => user.label === label).lastName = lName || lName_ph;

            users.find(user => user.label).label = ((fName || users) + "_" + (lName || lName_ph));
            localStorage.setItem("users", JSON.stringify(users));
            location.reload();
        }

        deleteSubjectButton.onclick = () => {
            const index = users.indexOf(users.find(user => user.label === label));
            if (index > -1) {
                users.splice(index, 1);
            }
            users.length ?
                localStorage.setItem("users", JSON.stringify(users)) : localStorage.clear();
            location.reload()
        };
        col.appendChild;
    }
}

