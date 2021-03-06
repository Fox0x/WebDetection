const SERVER_URL = "http://localhost:3010/fa6_api/processing";
const TOKEN = "7c47ebaf57bb7b870182ae3d36443190";

async function getNewTaskID() {
    let myHeaders = new Headers();
    myHeaders.append("Authorization", TOKEN);
    myHeaders.append("Content-Type", "multipart/form-data");

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: undefined,
        redirect: 'follow'
    };

    fetch(SERVER_URL, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
