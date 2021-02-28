const SERVER_URL = "https://afppgmc.face-six.com:3011/fa6_api/";
const TOKEN = "b0d037d2bfb311b51791bae981c41f6a";

async function getNewTaskID() {
	var myHeaders = new Headers();
	myHeaders.append("Authorization", "b0d037d2bfb311b51791bae981c41f6a");
	myHeaders.append("Content-Type", "multipart/form-data");
	
	var formdata = new FormData();
	formdata.append("POST", "{\"clientid\":3,\"locationid\":3, \"observations\":[]}");
	
	var requestOptions = {
	  method: 'POST',
	  headers: myHeaders,
	  body: formdata,
	  redirect: 'follow'
	};
	
	fetch("https://afppgmc.face-six.com:3011/fa6_api/processing", requestOptions)
	  .then(response => response.text())
	  .then(result => console.log(result))
	  .catch(error => console.log('error', error));
}
