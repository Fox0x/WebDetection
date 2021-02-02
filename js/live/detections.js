let faceImages;
let detections;
let minConfidence = 0.4;
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});


Promise.all([
    faceapi.loadSsdMobilenetv1Model("..//models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("..//models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("..//models"),
    faceapi.loadTinyFaceDetectorModel("..//models"),
]).then(drawDetections);

function drawDetections() {
    let model = document.getElementById('model');
    model.addEventListener('change', event => {
        model.value === 'tinyFaceDetector' ?
            options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, minConfidence}) :
            options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});
        console.log(options._name)
    });

    const video = document.getElementById("video");
    video.addEventListener("playing", () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = {width: video.width, height: video.height};
        faceapi.matchDimensions(canvas, displaySize);


        //every 100ms =>
        setInterval(async () => {
            //get detections
            detections = await faceapi
                .detectAllFaces(video, options)
                .withFaceLandmarks()
                .withFaceDescriptors();
            //clear canvas
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            if (detections.length > 0) {
                //resize canvas
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                //draw new canvas
                faceapi.draw.drawDetections(canvas, resizedDetections);
                detections.forEach(e => {

                });

                if (detections[0].detection.score > parseFloat(document.getElementById('confidenceOutput').value)) {
                    await extractFaceFromBox(video, detections[0].detection.box);
                    await addToImageList();
                }
            }

        }, 100);
    });
}

async function extractFaceFromBox(input, box) {
    const regionsToExtract = [new faceapi.Rect(box.x, box.y - 80, box.width + 20, box.height + 90)];
    //Creating canvas array
    faceImages = await faceapi.extractFaces(input, regionsToExtract);
}

