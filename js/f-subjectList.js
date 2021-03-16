app.register.controller("SListCtrl", function () {

    if (document.getElementById("spinner") !== null) {
        document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
    if (localStorage.length) {
        fillSubjectList();
    } else {
        new bootstrap.Modal(document.getElementById("emptySubjectAlertModal"), {}).show();
    }
});

function fillSubjectList() {
    const users = JSON.parse(localStorage.users);
    users.forEach(user => createNewSubject(user.image, user.fName, user.lName))

    function createNewSubject(image, firstName, lastName) {
        document.querySelector(".subject-row").innerHTML += '' +
            '<div class="col-2 m-3 p-0 subject-card">\n' +
            '        <img src="' + image + '">\n' +
            '        <input placeholder="' + firstName + '">\n' +
            '        <input placeholder="' + lastName + '">\n' +
            '        <button class="btn btn-outline-success">&#10004;&#65039;</button>\n' +
            '        <button class="btn btn-outline-danger">&#10006</button>\n' +
            '    </div>'
    }
}

