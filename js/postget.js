const SERVER_URL = "http://localhost:3010/fa6_api/";

async function getToken() {
	try {
		if (sessionStorage.token) {
			return sessionStorage.token;
		} else {
			const request = await fetch(SERVER_URL + "authenticate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "Admin@Admin",
					password: "@@@dmin",
					clientid: "1",
					locationid: "1",
				}),
				redirect: "follow",
			});
			const data = await request.json();
			console.log(
				"New token sucssessfully created! New token :>> ",
				data.token
			);
			sessionStorage.setItem("token", data.token);
			return data.token;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getTaskId() {
	try {
		const request = await fetch(SERVER_URL + "processing", {
			method: "POST",
			headers: {
				Authorization: await getToken(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				clientid: "1",
				locationid: "1",
				observations: [],
			}),
			redirect: "follow",
		});
		const data = await request.json();
		console.log("New taskId created, current ID :>> ", data.reply.taskid);
		return data.reply.taskid;
	} catch (error) {
		console.error(error);
	}
}

async function putImage(image, taskId) {
	let myHeaders = new Headers();
	myHeaders.append("Authorization", await getToken());
	myHeaders.append("Content-Type", "multipart/form-data");

	let formdata = new FormData();
	formdata.append(
		"POST",
		JSON.stringify({
			clientid: 1,
			locationid: 1,
			observations: [
				{
					timestamp: new Date().toLocaleString(),
					cameraid: 1,
					quality: "0.5",
					boundingbox: "1,1,2,2",
					tracklength: 10,
					imagedata: "image1",
				},
			],
		})
	);
	formdata.append("image1", await fetch(image).then(r => r.blob()), "/path/to/file");

	let requestOptions = {
		method: "PUT",
		headers: myHeaders,
		body: formdata,
		redirect: "follow",
	};
  
	fetch(SERVER_URL + "processing/" + taskId, requestOptions)
		.then((response) => response.json())
		.then(async (data) => {
			console.log(data);
			if (data.reply.result) {
				if (data.reply.result === "process created") {
					await putImage(image, data.reply.taskid);
				} else console.error(data);
			} else console.error(data);
		})
		.catch((error) => console.log("error", error));

	// try {
	//   const request = await fetch(SERVER_URL + "processing/" + taskId, {
	//     method: "PUT",
	//     headers: {
	//       Authorization: await getToken(),
	//       "Content-Type": "application/json",
	//     },
	//     body: JSON.stringify({
	//       clientid: "1",
	//       locationid: "1",
	//       cameraid: "1",
	//       quality: "0.5",
	//       boundingbox: "1,1,2,2",
	//       tracklength: "10",
	//       observations: [],
	//       timestamp: new Date().toLocaleString(),
	//       imagedata: image,
	//     }),
	//     redirect: "follow",
	//   });
	//   /*TODO: response from putImage() */
	//   // console.log(data);
	//   // if (data.reply.result) {
	//   //   if (data.reply.result === "process created") {
	//   //     await putImage(image, data.reply.taskid);
	//   //   }
	//   // }
	// } catch (error) {
	//   console.error(error);
	// }
}
