//Vars
let minConfidence = 0.8;
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 10});

//Detections func
let video;
let displaySize;
let canvas;
let faceMatcher;
let labeledDescriptors = [];

Promise.all([
    faceapi.loadSsdMobilenetv1Model('../models'),
    faceapi.loadFaceLandmarkModel('../models'),
    faceapi.loadFaceRecognitionModel('../models'),
    faceapi.loadTinyFaceDetectorModel('../models')
]).then(loadVideo).then(initVars);

function initVars() {
    displaySize = {width: video.width, height: video.height};
    canvas = document.getElementById('canvas');
    faceapi.matchDimensions(canvas, displaySize);

}

function loadVideo() {
    video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            video.addEventListener('playing', () => {
                //Get first detections
                getDetections()
                //Change preloader to live.htm
                document.getElementById('spinner').remove();
                document.getElementById('content').style.visibility = 'visible';
                document.getElementById('form1').style.visibility = 'visible';
            })
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });
}

let i = 1;

//Adding image to image list
function addToImageList(face) {
    let box = face.detection.box
    faceapi.extractFaces(video, [new faceapi.Rect(box.x, box.y, box.width, box.height)])
        .then(res => {
            res.forEach(canvas => {
                if (i <= 4) {
                    document.getElementById('outputImage' + i).src = canvas.toDataURL();
                    document.getElementById('form' + i).style.visibility = 'visible';
                    i++;
                } else {
                    i = 1;
                }
            })
        })
}

function addNewLabeledDescriptor(descriptor) {
    labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(
            'person ' + (labeledDescriptors.length + 1),
            [descriptor]
        ));

    console.log('We are had ' + labeledDescriptors.length + ' descriptors');
    //labeledDescriptors.forEach(ldesc => console.log(ldesc))

}

function getDetections() {
    console.log('Trying find faces');
    faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.6,
        maxResults: 4
    })).withFaceLandmarks().withFaceDescriptors()
        .then(resolve => {
            console.log('Detect ' + resolve.length + ' faces');
            if (resolve.length > 0) {
                resolve.forEach(fd => addNewLabeledDescriptor(fd.descriptor));
                faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
                matchFaces(faceMatcher);
                resolve.forEach(resolve => addToImageList(resolve));
            } else {
                getDetections();
            }
        });
}

function matchFaces(faceMatcher) {
    setInterval(async () => {
        faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors().then(resolve => {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            resolve.forEach(fd => {
                const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
                if (bestMatch.label.toString() === 'unknown') {
                    addToImageList(fd);
                    addNewLabeledDescriptor(fd.descriptor);
                    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
                } else {
                    drawBox(canvas, fd, bestMatch.toString());
                }
            });
        });
    }, 100);
}

//Draw canvas with any label
async function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(faceapi.resizeResults(face, displaySize).detection.box, {label});
    drawBox.draw(canvas);
}

//Controllers func
function increaseConfidence() {
    minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 0.9);
    document.getElementById('confidenceOutput').value = minConfidence;
    changeModel();
}

function decreaseConfidence() {
    minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1);
    document.getElementById('confidenceOutput').value = minConfidence;
    changeModel();
}

function changeModel() {
    let model = document.getElementById('model');
    model.value === 'tinyFaceDetector' ?
        options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, scoreThreshold: minConfidence}) :
        options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 10});
    console.log(options._name)
}