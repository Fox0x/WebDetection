Promise.all([
    faceapi.loadTinyFaceDetectorModel("../models"),
    faceapi.loadFaceLandmarkModel("../models"),
    faceapi.loadFaceRecognitionModel("../models"),
    faceapi.loadSsdMobilenetv1Model("../models"),
]).then(async () => {
    await loadVideo();

});


let video;
let videoStream;
let canvas;
let minConfidence = 0.6;
let options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: minConfidence,
});
let displaySize;


function loadVideo() {
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
                setTimeout(recognizeFace, 500);
                resolve();
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

async function showAddNewUserModal(fd) {
    console.log("showAddNewUserModal()");
    const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"), {focus: true});
    return new Promise(async (resolve, reject) => {
        video.pause();
        videoStream.getVideoTracks()[0].stop();
        addUserModal.show();
        document.getElementById("modalUserImage").src = await extractFace(fd);
        document.getElementById("modalTimestamp").value = new Date().toLocaleString();
        document.getElementById("modalScore").value = fd.detection.score.toFixed(2);
        document.getElementById("acceptUserButton").addEventListener('click', event => {
            addUserModal.hide();
            resolve();
        });

        document.getElementById("rejectUserButton").addEventListener('click', event => {
            addUserModal.hide();
            reject();
        });
    });
}

async function getDetection() {
    return new Promise(async (resolve) => {
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

        detections.length && resolve(detections);
    });
}

async function getLabeledDescriptors() {
    await updateLabeledDescriptors();
    if (labeledDescriptors.length) {
        return labeledDescriptors;
    } else {
        return new Promise(resolve => {
            if (!localStorage.length) {
                getDetection().then((detection) => {
                    detection.map((fd) => {
                        addNewUser(fd);
                    });
                });
            }
            labeledDescriptors.length && resolve(labeledDescriptors);
        });
    }
}


async function addNewUser(fd) {
    showAddNewUserModal(fd).then(async () => {
        let imageURL = await extractFace(fd);
        let recipientFname = document.getElementById("recipient-fname").value;
        let recipientLname = document.getElementById("recipient-lname").value;
        let label;
        recipientFname && recipientLname ? label = recipientFname + " " + recipientLname : label = (new Date()).toLocaleString();
        localStorage.setItem(
            label,
            JSON.stringify({
                image: imageURL,
                descriptor: fd.descriptor,
                score: fd.detection.score,
                firstName: recipientFname,
                lastName: recipientLname,
            })
        );
        await updateLabeledDescriptors();
        await loadVideo();
    }).catch(async () => {
        await loadVideo();
    })
}

async function recognizeFace() {
    let labeledDescriptors = await getLabeledDescriptors();
    let faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    let detections = await getDetection();
    await detections.map(async (fd) => {
        let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
        bestMatch.label === "unknown" ?
            await addNewUser(fd) :
            drawBox(canvas, fd, bestMatch.label + "  " + ((100 - bestMatch.distance * 100).toFixed(1) + "%"));
    });
    await recognizeFace();
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(
        faceapi.resizeResults(face, displaySize).detection.box, {label});
    drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
    let canvas;
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
    console.log(
        "Model " + options._name + " with confidence " + options._minConfidence
    );
}
