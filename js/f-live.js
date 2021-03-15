app.register.controller("LiveCtrl", function ($scope) {

    //========================================================//
});

let video;
let canvas;
let minConfidence = 0.6;
let options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 256,
    scoreThreshold: minConfidence,
});
let displaySize;
let localUsers = [];
let users = [];
//========================================================//

new Promise(async (resolve) => {

    await faceapi.nets.faceRecognitionNet.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/');
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights/');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        if (document.getElementById("content").style.visibility === "hidden") {
            if (document.getElementById("spinner") !== null) {
                document.getElementById("spinner").style.visibility = "hidden";
            }
            document.getElementById("content").style.visibility = "visible";
        }
        video = document.getElementById("video");
        video.srcObject = stream;
        displaySize = {width: video.width, height: video.height};
        canvas = document.getElementById("canvas");
        canvas.style.left = video.getBoundingClientRect().x + "px";
        faceapi.matchDimensions(canvas, displaySize);
        video.addEventListener('play', event => {
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
    console.log(detections)
    return detections;
}

const getLabeledDescriptors = async function () {
    return new Promise(async (resolve) => {
        if (labeledDescriptors.length) {
            console.log("Labeled descriptors exist locally")
            resolve(labeledDescriptors);
        } else if (localStorage.users) {
            console.log("Loading labeled descriptors from localStorage")
            const storage = JSON.stringify(localStorage.users)
            for await (const user of storage) {
                user.descriptor.forEach((descriptor, index) => {
                    user.descriptor[index] = Float32Array.from(Object.values(descriptor));
                });
            }
            for await (const user of storage) {
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(user.id.toString(), user.descriptor));
            }
            console.log(labeledDescriptors);
            resolve(labeledDescriptors);
        } else {
            console.log("Creating labeled descriptors");
            const detections = await getDetections();
            for await (const face of detections) {
                await addNewUser(face);
                labeledDescriptors.push(
                    new faceapi.LabeledFaceDescriptors((labeledDescriptors.length + 1).toString(), [face.descriptor])
                )
            }
            resolve(labeledDescriptors);
        }
    });
}
let i = 1;
const addNewUser = async function (face) {
    const userFace = await extractFace(face);
    localUsers.push({
        image: userFace,
        descriptor: [face.descriptor],
        score: face.detection.score,
        timestamp: (new Date).toLocaleString(),
        id: (localUsers.length)
    });
    document.querySelector("div#user-card-" + i + " img").src = userFace;
    document.querySelector("div#user-card-" + i + " img").alt = JSON.stringify({
        image: userFace,
        descriptor: [face.descriptor],
        score: face.detection.score,
        timestamp: (new Date).toLocaleString(),
        id: (localUsers.length)
    })
    i <= 3 ? i++ : i = 1;
}

// noinspection InfiniteRecursionJS
const recognizeFace = async function () {
    console.log('recognizing face')
    const faceMatcher = await new faceapi.FaceMatcher(await getLabeledDescriptors());
    const detections = await getDetections();
    for await (const face of detections) {
        let bestMatch = faceMatcher.findBestMatch(face.descriptor, 0.5);
        await drawBox(canvas, face, "score: " + face.detection.score.toFixed(2) + " " + "trackerId: " + bestMatch.label);
        if (bestMatch.label === "unknown") {

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
    return faceCanvas[0].toDataURL('image/jpeg', 1.0);
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
    console.log(
        "Model " +
        options._name +
        " with confidence " +
        (options._minConfidence || options._scoreThreshold)
    );
}

const submit = async function (id) {
    const user = document.querySelector("div#user-card-" + id + " img").alt
    this.users.push({
        fName: document.querySelector("div#user-card-" + id + " input")[0].value,
        lName: document.querySelector("div#user-card-" + id + " input")[1].value,
        image: user.image,
        descriptor: user.descriptor,
        score: user.score,
        timestamp: user.timestamp,
        id: user.id
    })
    localStorage.setItem("users", JSON.stringify(users));
}