const SERVER_URL = "http://afppgmc.face-six.com:3010/fa6_api/";
const TOKEN = "b0d037d2bfb311b51791bae981c41f6a";

async function getNewTaskID() {
  fetch(SERVER_URL + "processing", {
    method: "POST",
    headers: {
		"Authorization": "b0d037d2bfb311b51791bae981c41f6a",
		"Content-Type": "multipart/form-data"
	},
    redirect: "follow",
  }).then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));;
}
