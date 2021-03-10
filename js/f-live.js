app.register.controller("LiveCtrl", function () {
    Promise.all([
        faceapi.loadTinyFaceDetectorModel("../models"),
        faceapi.loadFaceLandmarkModel("../models"),
        faceapi.loadFaceRecognitionModel("../models"),
        faceapi.loadSsdMobilenetv1Model("../models"),
    ]);
    loadVideo().then(recognizeFace)
})

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
let users = []

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
                video.addEventListener('playing', async () => {
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
    return new Promise(async resolve => {
        if (labeledDescriptors.length) {
            resolve(labeledDescriptors);
        } else if (localStorage.length) {
            labeledDescriptors = [];
            users = JSON.parse(localStorage.users);
            users.forEach(user => {
                user.descriptor.forEach((descriptor, index) => {
                    user.descriptor[index] = Float32Array.from(Object.values(descriptor));
                })
            })
            users.forEach(user => {
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
                    user.firstName + ' ' + user.lastName,
                    user.descriptor
                ));
            })
            resolve(labeledDescriptors);
        } else {
            getDetections().then(detections => {
                detections.map(async face => {
                    showAddNewUserModal(await extractFace(face), face.detection.score).then(async () => {
                        await addNewUser(face);
                        resolve(labeledDescriptors);
                    })
                })
            })
        }
    })
}

async function showAddNewUserModal(faceImage) {
    const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"), {focus: true});
    return new Promise(async (resolve, reject) => {
        video.pause();
        addUserModal.show();
        document.getElementById("modalUserImage").src = faceImage;
        document.getElementById("acceptUserButton").addEventListener('click', () => {
            addUserModal.hide();
            video.play();
            resolve()
        });
        document.getElementById("rejectUserButton").addEventListener('click', () => {
            addUserModal.hide();
            video.play();
            reject()
        });
    });
}

async function addNewUser(face) {
    return new Promise(async resolve => {
        const firstName = document.getElementById("recipient-fname").value;
        const lastName = document.getElementById("recipient-lname").value
        if (!users.some(user => user.label === firstName + "_" + lastName)) {
            console.log("Add new user")
            users.push(
                {
                    label: firstName + "_" + lastName,
                    image: await extractFace(face),
                    descriptor: [face.descriptor],
                    score: face.detection.score,
                    firstName,
                    lastName,
                    created: (new Date).toLocaleString()
                }
            );

        } else {
            console.log("User exists");
            let descriptor = users.find(user => user.label === firstName + "_" + lastName)["descriptor"];
            descriptor.push(face.descriptor);
            users.find(user => user.label === firstName + "_" + lastName)["descriptor"] = descriptor;
        }
        console.log("Save users to localStorage");
        localStorage.setItem("users", JSON.stringify(users));
        console.log("Update labeledDescriptors");
        users.forEach(user => {
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
                user.firstName + ' ' + user.lastName,
                user.descriptor
            ));
        })
        resolve();
    });
}

async function recognizeFace() {
    const labeledDescriptors = await getLabeledDescriptors()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const detections = await getDetections();
    for (const face of detections) {
        let bestMatch = faceMatcher.findBestMatch(face.descriptor, 0.5);
        if (bestMatch.label === "unknown") {
            const faceImage = await extractFace(face)
            await showAddNewUserModal(faceImage, face.detection.score).then(async () => {
                await addNewUser(face)
            }).catch(async () => await recognizeFace());
        } else {
            drawBox(canvas, face, bestMatch.label + "  " + ((100 - bestMatch.distance * 100).toFixed(1) + "%"));
        }
    }
    await recognizeFace()
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(
        faceapi.resizeResults(face, displaySize).detection.box, {label});
    drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
    const box = face.detection.box;
    const regionsToExtract = [new faceapi.Rect(box.x - 70, box.y - 90, box.width + 70, box.height + 90)];
    const faceCanvas = await faceapi.extractFaces(video, regionsToExtract);
    return faceCanvas[0].toDataURL("image/png", 1.0);
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
    console.log("Model " + options._name + " with confidence " + (options._minConfidence || options._scoreThreshold));
}

//========================================================//


