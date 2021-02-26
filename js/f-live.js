Promise.all([
    faceapi.loadSsdMobilenetv1Model("../models"),
    faceapi.loadFaceLandmarkModel("../models"),
    faceapi.loadFaceRecognitionModel("../models"),
    faceapi.loadTinyFaceDetectorModel("../models"),
    console.log('all models are loaded')
]);

let video;
let canvas;
let minConfidence = 0.6;
let options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: minConfidence,
})
window.onload = () => {
    loadVideo();

}
let displaySize;

function loadVideo() {
    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        .then(function (stream) {
            video = document.getElementById('video');
            video.srcObject = stream;
            video.play();
            video.addEventListener('playing', () => {
                recognizeFace()
                document.getElementById("content").style.visibility = "visible";
                document.getElementById("spinner").remove();
                canvas = document.getElementById("canvas");
                displaySize = {
                    width: video.width,
                    height: video.height
                };
                canvas.style.left = video.getBoundingClientRect().x + "px";
                faceapi.matchDimensions(canvas, displaySize);
            });
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });

}

async function getDetection() {
    let detections = [];
    while (!detections.length) {
        detections = faceapi.resizeResults(await faceapi.detectAllFaces(video, options)
            .withFaceLandmarks()
            .withFaceDescriptors(), displaySize);
            if (canvas) {
                canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            }
    }
    
    return detections;
};

async function updateLabeledDescriptors() {
    for (let i = 0; i < localStorage.length; i++) {
        const descriptor = Float32Array.from(Object.values(JSON.parse(localStorage.getItem("person " + (i + 1))).descriptor));
        labeledDescriptors.push(new faceapi.LabeledFaceDescriptors("person " + (i + 1), [descriptor]));
    };
}

async function getLabeledDescriptors() {
    if (!localStorage.length) {
        console.log("localStorage is empty");
        let detections = await getDetection();
        await detections.forEach(async (fd) => {
            await addNewUser(fd);
        });
    };
    await updateLabeledDescriptors();
    return labeledDescriptors;
};

async function addNewUser(fd) {
    await extractFace(fd).then((imageURL) => {
        localStorage.setItem(
            'person ' + (localStorage.length + 1),
            JSON.stringify({
                image: imageURL,
                descriptor: fd.descriptor,
                score: fd.detection.score,
                created: new Date().toLocaleString(),
            }));
    });
    await updateLabeledDescriptors();

};

async function recognizeFace() {

    labeledDescriptors = await getLabeledDescriptors();
    setInterval(async () => {
        if (labeledDescriptors.length) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
            //detecting all faces
            let detections = await getDetection();
            detections.forEach(async (fd) => {
                //find best match with first detection
                let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
                //If person is unknown
                if (bestMatch.label === "unknown") {
                    await addNewUser(fd);

                } else {
                    drawBox(canvas, fd, bestMatch.label + "  " + ((100 - bestMatch.distance * 100).toFixed(1) + "%"));
                }
            });

        } else getLabeledDescriptors();
    }, 100);

};

//Draw canvas with any label
function drawBox(canvas, face, label) {

    const drawBox = new faceapi.draw.DrawBox(
        faceapi.resizeResults(face, displaySize).detection.box, {
            label
        });
    drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
    let canvas;
    let box = face.detection.box;
    await faceapi.extractFaces(video, [
        new faceapi.Rect(box.x, box.y, box.width, box.height),
    ]).then((resolve) => {
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
    model.value === "tinyFaceDetector" ?
        (options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: minConfidence,
        })) :
        (options = new faceapi.SsdMobilenetv1Options({
            minConfidence,
            maxResults: 10,
        }));
    console.log(
        "Model " + options._name + " with confidence " + options._minConfidence
    );
}