const SERVER_URL = "http://localhost:3010/fa6_api/";

async function getToken() {
  try {
    if (localStorage.token) {
      return localStorage.token;
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
      localStorage.setItem("token", data.token);
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

async function putImage(image) {
  try {
    const request = await fetch(
      SERVER_URL + "processing/" + (await getTaskId()),
      {
        method: "PUT",
        headers: {
          Authorization: await getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientid: "1",
          locationid: "1",
          cameraid: "1",
          quality: "0.5",
          boundingbox: "1,1,2,2",
          tracklength: "10",
          observations: [],
          timestamp: (new Date).toLocaleString(),
          imagedata: image,
        }),
        redirect: "follow",
      }
    );
    const data = await request.json();
    console.log(data)
  } catch (error) {
    console.error(error);
  }
}
// async function putImage(imageUrl, timestamp) {
//         let TOKEN = await getToken();
//         getNewTaskId().then(taskId => {
//             let URL = SERVER_URL + "processing/" + taskId
//             console.log(URL)
//             let requestOptions = {
//                 method: 'PUT',
//                 headers: {
//                     "Authorization": TOKEN,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     clientid: "1",
//                     locationid: "1",
//                     cameraid: "1",
//                     quality: "0.5",
//                     boundingbox: "1,1,2,2",
//                     tracklength: "10",
//                     observations: [],
//                     timestamp: timestamp,
//                     imagedata: imageUrl
//
//                 }),
//                 redirect: 'follow'
//             };
//             fetch(URL, requestOptions)
//                 .then(response => response.json())
//                 .then(result => {
//                     console.log(result);
//                 })
//                 .catch(error => console.log('error', error));
//         });
//
// }
