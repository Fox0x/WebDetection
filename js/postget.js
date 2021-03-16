const SERVER_URL = "http://localhost:3010/fa6_api/";
const EMAIL = "Admin@Admin";
const PASSWORD = "@@@dmin";

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
                    email: EMAIL,
                    password: PASSWORD,
                    clientid: "1",
                    locationid: "1",
                }),
                redirect: "follow",
            });
            const data = await request.json();
            console.log("New token sucssessfully created! New token :>> ", data.token);
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

async function putImage(canvas, taskId) {
    let myHeaders = new Headers();
    myHeaders.append("Authorization", await getToken());
    myHeaders.append("Content-Type", "multipart/form-data");

    let formData = new FormData();
    formData.append("POST", JSON.stringify({
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
    }));
    formData.append("image1", canvas.toDataURL('image/jpeg', 1.0))


    let requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };

    fetch(SERVER_URL + "processing/" + taskId, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
        }).catch((error) => console.error("error", error));
}
