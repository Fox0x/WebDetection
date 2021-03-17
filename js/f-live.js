app.register.controller("LiveCtrl", function () {
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/'),
        faceapi.nets.tinyFaceDetector.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/'),
    ]).then(init);
});

let video;
let canvas;
let minConfidence = 0.7;
let options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 256,
    scoreThreshold: minConfidence,
});
let displaySize;
let localUsers = [];
let globalUsers = localStorage.users ? JSON.parse(localStorage.users) : [];
//========================================================//

const init = () => {
    console.debug("init()");
    document.getElementById("spinner").style.visibility = "visible"
    return new Promise(async (resolve) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});

            video = document.getElementById("video");
            video.srcObject = stream;
            displaySize = {width: video.width, height: video.height};
            canvas = document.getElementById("canvas");
            canvas.style.left = video.getBoundingClientRect().x + "px";
            faceapi.matchDimensions(canvas, displaySize);
            video.addEventListener('play', () => {
                if (document.getElementById("content").style.visibility === "hidden") {
                    if (document.getElementById("spinner") !== null) {
                        document.getElementById("spinner").style.visibility = "hidden";
                    }
                    document.getElementById("content").style.visibility = "visible";
                }
                resolve();
            });
        } catch (e) {
            console.error(e);
            // new bootstrap.Modal(document.getElementById("cameraAlertModal"), {
            //     backdrop: false,
            // }).show();
        }
    }).then(async () => {
        await recognizeFace();
    });
}

const getDetections = async function () {
    let detections = [];
    while (detections.length === 0) {
        detections = faceapi.resizeResults(
            await faceapi
                .detectAllFaces(video, options)
                .withFaceLandmarks()
                .withFaceDescriptors(),
            displaySize
        );
        if (canvas) {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    return detections;
}

const getLabeledDescriptors = async function () {
    return new Promise(async (resolve) => {
        if (labeledDescriptors.length) {
            // console.log("Labeled descriptors exist locally")
            resolve(labeledDescriptors);
        } else if (globalUsers.length) {
            for await(let user of globalUsers) {
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(user.fName + " " + user.lName, [Float32Array.from(Object.values(user.descriptor))]))
            }
            resolve(labeledDescriptors);

        } else if (localStorage.users) {
            // console.log("Loading labeled descriptors from localStorage")
            const storage = JSON.parse(localStorage.users)
            for await (let user of storage) {
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(user.fName + " " + user.lName, [Float32Array.from(Object.values(user.descriptor))]));
            }
            resolve(labeledDescriptors);
        } else {
            // console.log("Creating labeled descriptors");
            const detections = await getDetections();
            for await (let face of detections) {
                await addNewUser(face);
                labeledDescriptors.push(
                    new faceapi.LabeledFaceDescriptors("trackerId: " + localUsers.length, [Float32Array.from(Object.values(face.descriptor))])
                )
            }
            resolve(labeledDescriptors);
        }
    });
}
let i = 0;
const addNewUser = async function (face) {
    const userCanvas = await extractFace(face);
    const userFace = await userCanvas.toDataURL('image/jpeg', 1.0);
    const taskId = await getTaskId();
    i < 3 ? i++ : i = 1;
    localUsers[i - 1] = {
        image: userFace,
        descriptor: face.descriptor,
        score: face.detection.score,
        timestamp: (new Date).toLocaleString(),
        taskId: taskId
    };
    document.querySelector("div#user-card-" + i + " img").src = userFace;
    document.querySelector("div#user-card-" + i + " img").alt = JSON.stringify({
        image: userFace,
        descriptor: face.descriptor,
        score: face.detection.score,
        timestamp: (new Date).toLocaleString(),
        taskId: taskId
    })
}

// noinspection InfiniteRecursionJS
const recognizeFace = async function () {
    const faceMatcher = await new faceapi.FaceMatcher(await getLabeledDescriptors());
    const detections = await getDetections();
    for await (let face of detections) {
        let bestMatch = faceMatcher.findBestMatch(face.descriptor, 0.5);
        drawBox(canvas, face, "score: " + face.detection.score.toFixed(2) + " " + bestMatch.label + " ");
        if (bestMatch.label === "unknown") {
            await addNewUser(face);
        }
        if (globalUsers.length) {
            const glUser = globalUsers.find(user => (user.fName + " " + user.lName) === bestMatch.label);
            glUser && await putImage(await extractFace(face), glUser.taskId);
        }
    }
    await recognizeFace();
}

//Draw canvas with any label 
function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(face.detection.box, {label});
    drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
    const box = face.detection.box;
    const regionsToExtract = [
        new faceapi.Rect(box.x - 70, box.y - 90, box.width + 70, box.height + 90),
    ];
    const faceCanvas = await faceapi.extractFaces(video, regionsToExtract);
    return faceCanvas[0];
}

//Controllers func
const increaseConfidence = function () {
    minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 0.9);
    document.getElementById("confidenceOutput").value = minConfidence;
    changeModel();
}

const decreaseConfidence = function () {
    minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1);
    document.getElementById("confidenceOutput").value = minConfidence;
    changeModel();
}

const changeModel = function () {
    let model = document.getElementById("model");
    model.value === "tinyFaceDetector"
        ? (options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: minConfidence,
        }))
        : (options = new faceapi.SsdMobilenetv1Options({
            minConfidence,
            maxResults: 10,
        }));
    console.log("Model " + options._name + " with confidence " +(options._minConfidence || options._scoreThreshold));
}

const submit = async function (id) {
    let currentUser = localUsers.find(user => user.image === JSON.parse(document.querySelector("div#user-card-" + 1 + " img").alt).image)
    currentUser.fName = document.querySelectorAll("div#user-card-" + id + " input")[0].value
    currentUser.lName = document.querySelectorAll("div#user-card-" + id + " input")[1].value
    await globalUsers.push(currentUser);
    localStorage.setItem("users", JSON.stringify(globalUsers));
    labeledDescriptors = [];
    await getLabeledDescriptors();
    document.querySelector("div#user-card-" + id + " img").src = "./img/user.png"
    document.querySelectorAll("div#user-card-" + id + " input")[0].value = "";
    document.querySelectorAll("div#user-card-" + id + " input")[1].value = "";

}

const reject = async function (id) {
    console.log(id)
    localUsers.splice(id - 1, 1);
    i--;
    labeledDescriptors = [];
    document.querySelector("div#user-card-" + id + " img").src = "./img/user.png"
    document.querySelectorAll("div#user-card-" + id + " input")[0].value = "";
    document.querySelectorAll("div#user-card-" + id + " input")[1].value = "";
}