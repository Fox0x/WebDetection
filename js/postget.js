const SERVER_URL = "http://afppgmc.face-six.com:3010/fa6_api";
const SECRET = "cdf709b4cd8ecb0a7f0210118d6a73dc";

async function getNewTaskID() {
  fetch(SERVER_URL + "/processing", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-type": "multipart/form-data",
      Authorization: SECRET,
    },
    body: undefined
  }).then(response => console.log(response));
}
