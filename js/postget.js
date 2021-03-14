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
  try {
    const userImage = image;
    const request = await fetch(SERVER_URL + "processing/" + taskId, {
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
        timestamp: new Date().toLocaleString(),
        imagedata: image,
      }),
      redirect: "follow",
    });
    const data = await request.json();
    /*TODO: response from putImage() */
    // console.log(data);
    // if (data.reply.result) {
    //   if (data.reply.result === "process created") {
    //     await putImage(image, data.reply.taskid);
    //   }
    // }
  } catch (error) {
    console.error(error);
  }
}
