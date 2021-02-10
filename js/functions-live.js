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
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 1});
//Image functions
let isPhotoPicked = [false, false, false, false];

async function extractFaceFromBox(input, box) {
    const regionsToExtract = [new faceapi.Rect(box.x - 50, box.y - 90, box.width + 50, box.height + 50)];
    //Creating canvasEl array
    let faceImages = await faceapi.extractFaces(input, regionsToExtract);
    await addToImageList(faceImages)
}

let i = 1;

async function addToImageList(faceImages) {
    await faceImages.forEach(canvas => {
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
    console.log(myForm[imageId - 1].image);
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
let labeledDescriptor;
let video;

Promise.all([
    console.log('Models start loading'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    console.log("Models are loaded")
]).then(loadVideo);


function loadVideo() {
    console.log('getting video')
    navigator.getUserMedia(
        {video: {}},
        stream => (document.getElementById('video').srcObject = stream),
        err => console.error(err)
    );
    console.log('video loaded')
    document.getElementById('video').addEventListener('playing', () => {
        video = document.getElementById('video');
        getDetections().then(r => console.log('getDetections is complete'));
    });
}


async function getDetections() {
    const canvas = document.getElementById('canvas');
    const displaySize = {width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        //get detections
        const results = await faceapi.detectAllFaces(video, options);

//resize canvas
        const resizedDetections = faceapi.resizeResults(results, displaySize);

        for (const detection of resizedDetections) {
            if (detection.score >= minConfidence) {
                //faceapi.draw.drawDetections(canvas, detection)
                if (labeledDescriptor === undefined) {
                    labeledDescriptor = await faceapi.computeFaceDescriptor(video);
                    //console.log('labeledDescriptor length is: ' + labeledDescriptor.length);
                } else {
                    await name(detection, canvas);
                }
            }
        }
    }, 100);

}

async function name(detection, canvas) {
    let currentDescriptor = await faceapi.computeFaceDescriptor(video);
    //console.log('currentDescriptor length is: ' + currentDescriptor.length);
    const distance = 100 - faceapi.euclideanDistance(currentDescriptor, labeledDescriptor) * 100;
    //console.log('similar on: ' + (100 - distance * 100).toFixed(1) + '%');
    let label;
    distance >= 55 ?
        label = 'similar on: ' + (distance).toFixed(1) + '%' :
        label = 'person not similar';
//clear canvas
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    const drawBox = new faceapi.draw.DrawBox(detection.box, {label});
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