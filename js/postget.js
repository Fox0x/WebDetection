const SERVER_URL = "http://localhost:3010/fa6_api/";
//TODO: Переделай с вызовом функций с параметром.

// async function getToken() {
//         return localStorage.token || new Promise(() => {
//             const URL = SERVER_URL + "authenticate";
//             console.log(URL);
//             let requestOptions = {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     email: "Admin@Admin",
//                     password: "@@@dmin",
//                     clientid: "1",
//                     locationid: "1",
//                 }),
//                 redirect: 'follow'
//             };
//
//             fetch(URL, requestOptions).then(response => response.json()).then(result => {
//                 console.log("Token successfully updated. New token: ", result.token);
//                 localStorage.setItem("token", result.token);
//                 return result.token;
//             })
//                 .catch(error => console.log('error', error));
//         })
// }
//
// async function getNewTaskId() {
//     getToken().then(TOKEN => {
//         let URL = SERVER_URL + "processing";
//         console.log(URL)
//         let requestOptions = {
//             method: 'POST',
//             headers: {
//                 Authorization: TOKEN,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 clientid: "1",
//                 locationid: "1",
//                 observations: []
//             }),
//             redirect: 'follow'
//         };
//
//         fetch(URL, requestOptions)
//             .then(response => response.json()).then((result) => {
//             console.log("Task ID created. Current taskid: ", result.reply.taskid);
//             return result.reply.taskid;
//         })
//             .catch(error => console.log('error', error));
//     });
// }
//
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
