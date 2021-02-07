'use strict';

let myForm = [{
    image: '',
    firstName: '',
    secondName: ''
}, {
    image: '',
    firstName: '',
    secondName: ''
}, {
    image: '',
    firstName: '',
    secondName: ''
}, {
    image: '',
    firstName: '',
    secondName: ''
}]


function showForm(formId) {
    document.querySelectorAll('form').forEach(element => {
        //Hide all forms
        element.style.visibility = "hidden";
        //Clear showForm when hide
        element.reset();
    });
    document.getElementById(formId).style.visibility = "visible";
}