Promise.all([
    faceapi.loadTinyFaceDetectorModel("../models"),
    faceapi.loadFaceLandmarkModel("../models"),
    faceapi.loadFaceRecognitionModel("../models"),
    faceapi.loadSsdMobilenetv1Model("../models"),
]).then(async () => {
    await loadVideo().then(recognizeFace)

});
//========================================================//
let video;
let videoStream;
let canvas;
let minConfidence = 0.6;
let options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: minConfidence,
});
let displaySize;
let isRecognizing = true;

//========================================================//

async function loadVideo() {
    return new Promise((resolve) => {
        navigator.mediaDevices.getUserMedia({video: true, audio: false,})
            .then((stream) => {
                document.getElementById("content").style.visibility === "hidden" && showContent();
                video = document.getElementById("video");
                videoStream = stream;
                video.srcObject = videoStream;
                canvas = document.getElementById("canvas");
                displaySize = {width: video.width, height: video.height};
                canvas.style.left = video.getBoundingClientRect().x + "px";
                faceapi.matchDimensions(canvas, displaySize);
                video.addEventListener('playing', async event => {
                    canvas.style.left = video.getBoundingClientRect().x + "px";
                    resolve();
                });
            }).catch(reason => {
            new bootstrap.Modal(document.getElementById("cameraAlertModal"), {
                focus: true,
            }).show();
            console.log("An error occurred: " + reason);
        });
    });

    function showContent() {
        if (document.getElementById("spinner") !== null) {
            document.getElementById("spinner").style.visibility = "hidden";
        }
        document.getElementById("content").style.visibility = "visible";
    }
}

async function getDetections() {
    let detections = [];
    while (!detections.length) {
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

async function getLabeledDescriptors() {
    await updateLabeledDescriptors();
    if (labeledDescriptors.length) {
        return labeledDescriptors;
    } else {
        return new Promise(async resolve => {
            if (!localStorage.length) {
                let detections = await getDetections();
                detections.map(async detection => {
                    await showAddNewUserModal(detection);
                })
            }
            labeledDescriptors.length && resolve(labeledDescriptors);
        });
    }
}

async function showAddNewUserModal(fd) {
    const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"), {focus: true});
    return new Promise(async (resolve, reject) => {
        video.pause();
        addUserModal.show();
        const imageURL = await extractFace(fd);
        const timestamp = (new Date).toLocaleString();
        const score = fd.detection.score.toFixed(2);
        document.getElementById("modalUserImage").src = imageURL;
        document.getElementById("modalTimestamp").value = timestamp;
        document.getElementById("modalScore").value = score;
        document.getElementById("acceptUserButton").addEventListener('click', event => {
            const descriptor = fd.descriptor;
            const recipientFname = document.getElementById("recipient-fname").value;
            const recipientLname = document.getElementById("recipient-lname").value;
            let label;
            recipientFname && recipientLname ? label = recipientFname + " " + recipientLname : label = timestamp;
            addNewUser(label, imageURL, descriptor, score, recipientFname, recipientLname)
                .then(async () => {
                    addUserModal.hide();
                    await loadVideo().then(async () => {
                        resolve();
                        await recognizeFace();
                    })
                });
        });

        document.getElementById("rejectUserButton").addEventListener('click', async event => {
            addUserModal.hide();
            await loadVideo().then(async () => {
                reject();
                await recognizeFace();
            });
        });
    });
}

async function addNewUser(label, imageURL, descriptor, score, recipientFname, recipientLname) {
    return new Promise(async resolve => {
        localStorage.setItem(label, JSON.stringify({
                image: imageURL,
                descriptor: descriptor,
                score: score,
                firstName: recipientFname,
                lastName: recipientLname,
            })
        );
        await updateLabeledDescriptors();
        resolve()
    });
}

async function recognizeFace() {
    const labeledDescriptors = await getLabeledDescriptors()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    getDetections().then(async (detections) => {
        await detections.map(async (fd) => {
            let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
            if (bestMatch.label === "unknown") {
                await showAddNewUserModal(fd)
            } else {
                drawBox(canvas, fd, bestMatch.label + "  " + ((100 - bestMatch.distance * 100).toFixed(1) + "%"));
                await recognizeFace();
            }
        });
    });
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(
        faceapi.resizeResults(face, displaySize).detection.box, {label});
    drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
    let box = face.detection.box;
    await faceapi
        .extractFaces(video, [
            new faceapi.Rect(box.x - 70, box.y - 90, box.width + 70, box.height + 90),
        ])
        .then((resolve) => {
            resolve.forEach((resolve) => {
                canvas = resolve;
            });
        });
    return canvas.toDataURL();
}

//Controllers func
function increaseConfidence() {
    minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 0.9);
    document.getElementById("confidenceOutput").value = minConfidence;
    changeModel();
}

function decreaseConfidence() {
    minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1);
    document.getElementById("confidenceOutput").value = minConfidence;
    changeModel();
}

function changeModel() {
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
    console.log("Model " + options._name + " with confidence " + options._minConfidence && options._scoreThreshold);
}

//========================================================//


