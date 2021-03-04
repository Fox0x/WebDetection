const SERVER_URL = "https://afppgmc.face-six.com:3011/fa6_api/";
const TOKEN = "7c47ebaf57bb7b870182ae3d36443190";

async function getNewTaskID() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "7c47ebaf57bb7b870182ae3d36443190");
    myHeaders.append("Content-Type", "multipart/form-data");

    var formdata = new FormData();
    formdata.append("POST", "{\"clientid\":3,\"locationid\":3, \"observations\":[]}");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    fetch("http://localhost:3010/fa6_api/processing", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
