'use strict';

Promise.all([
    console.log('Models start loading'),
    faceapi.loadSsdMobilenetv1Model("..//models"),
    faceapi.loadTinyFaceDetectorModel("..//models"),
    console.log("Models are loaded")
]).then(() => {
    navigator.getUserMedia(
        {video: {}},
        stream => (document.getElementById('video').srcObject = stream),
        err => console.error(err)
    );
}).then(onVideoLoaded);

async function onVideoLoaded() {
    document.getElementById('video').addEventListener('playing', event => {
        const video = document.getElementById('video');
        getDetections(video);
    });
}

let minConfidence = 0.4;
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});

function changeModel () {
    let model = document.getElementById('model');
    model.value === 'tinyFaceDetector' ?
        options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, minConfidence}) :
        options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});
    console.log(options._name)
}

async function getDetections(video) {
    const canvas = document.getElementById('canvas');
    const displaySize = {width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);
    //every 100ms =>
    setInterval(async () => {
        //get detections
        const detections = await faceapi.detectAllFaces(video, options);
        //resize canvas
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        //clear canvas
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        resizedDetections.forEach(detections => {
            const label = "Person " + (resizedDetections.indexOf(detections) + 1) +
                "  sc: " + detections.score.toFixed(2).toString();
            const drawBox = new faceapi.draw.DrawBox(detections.box, { label });
            drawBox.draw(canvas);
        })
    }, 100);
}
//
// async function extractFaceFromBox(input, box) {
//     const regionsToExtract = [new faceapi.Rect(box.x, box.y - 80, box.width + 20, box.height + 90)];
//     //Creating canvasEl array
//     faceImages = await faceapi.extractFaces(input, regionsToExtract);
// }

