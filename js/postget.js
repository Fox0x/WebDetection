const SERVER_URL = "http://localhost:3010/fa6_api/";
const TOKEN = ""

async function getToken(email, password) {
    let requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            email,
            password,
            clientid: "1",
            locationid: "1"
        },
        redirect: 'follow'
    };

    fetch(SERVER_URL + "authenticate", requestOptions)
        .then(response => console.log(response))
        .catch(error => console.log('error', error));
}

async function getNewTaskId() {
    let requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": TOKEN,
        },
        body: {
            clientid: "1",
            locationid: "1",
            observations: [],
        },
        redirect: 'follow'
    };

    fetch(SERVER_URL + "processing", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

async function putImage(taskId, image) {
    let requestOptions = {
        method: 'PUT',
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": TOKEN,
        },
        body: {
            clientid: "1",
            locationid: "1",
            cameraid: "1",
            quality: "0.5",
            boundingbox: "1,1,2,2",
            tracklength: "10",
            observations: [],
            //TODO: Доделай параметры.
            timestamp: "",
            imagedata: image

        },
        redirect: 'follow'
    };

    fetch(SERVER_URL + "processing/" + taskId, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
