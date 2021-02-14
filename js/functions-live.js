//Vars
let myForm = [
    {
        image: '',
        firstName: '',
        secondName: ''
    },
    {
        image: '',
        firstName: '',
        secondName: ''
    },
    {
        image: '',
        firstName: '',
        secondName: ''
    },
    {
        image: '',
        firstName: '',
        secondName: ''
    }
];
let minConfidence = 0.8;
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 10});

//Image functions
let isPhotoPicked = [false, false, false, false];

let i = 1;

function addToImageList(input, box) {
    let facesArray = [faceapi.extractFaces(input, [new faceapi.Rect(box.x - 50, box.y - 90, box.width + 50, box.height + 50)])];

    facesArray.forEach(canvas => {
        if (i <= 4) {
            if (canvas.toDataURL() !== null) {
                if (!isPhotoPicked[i - 1]) {
                    document.onload = function () {
                        document.getElementById('outputImage' + i).src = canvas.toDataURL();
                    }
                }
                i++;
            }
        } else {
            i = 1;
        }
    });
}

function onClick(imageId) {
    showForm('form' + imageId);
    isPhotoPicked = [false, false, false, false];
    isPhotoPicked[imageId - 1] = true;
    myForm[imageId - 1].image = document.getElementById('outputImage' + imageId).src;
    console.log(isPhotoPicked);
}

//Form functions
function showForm(formId) {
    document.querySelectorAll('form').forEach(element => {
        //Hide all forms
        element.style.visibility = "hidden";
        //Clear showForm when hide
        element.reset();
    });
    document.getElementById(formId).style.visibility = "visible";
}

//Detections func
let video;

Promise.all([
    faceapi.loadSsdMobilenetv1Model('../models'),
    faceapi.loadFaceLandmarkModel('../models'),
    faceapi.loadFaceRecognitionModel('../models'),
]).then(loadVideo);

function loadVideo() {
    navigator.getUserMedia(
        {video: {}},
        stream => (document.getElementById('video').srcObject = stream),
        err => console.error(err)
    );
    document.getElementById('video').addEventListener('playing', () => {
        video = document.getElementById('video');
        detect().then(r => getDetections(r)).then()
    });
}

async function detect() {
    return faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
}

function getDetections(detectionsArray) {
    console.log('detect ' + detectionsArray.length + ' faces')
    const faceMatcher = new faceapi.FaceMatcher(detectionsArray);

    matchFace(faceMatcher);
}

function matchFace(faceMatcher) {
    let canvas = document.getElementById('canvas');
    let displaySize = {width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(() => {
        const secondDetectArray = detect().then();
        if (secondDetectArray && secondDetectArray.length > 0) {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            secondDetectArray.forEach(fd => {
                const bestMatch = faceMatcher.findBestMatch(fd.descriptor).toString();
                bestMatch.label === 'unknown' ?
                    //TODO: удали нахер отображение и добавь создание перса
                    drawBox(canvas, fd.detection.box, bestMatch.toString()) :

                    drawBox(canvas, fd.detection.box, bestMatch.toString())
            });
        }
    }, 100);
}

//Draw canvas with any label
async function drawBox(canvas, box, label) {
    //TODO: добавь ресайзрезулт
    const drawBox = new faceapi.draw.DrawBox(box, {label});
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