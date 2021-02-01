let faceImages;
let detections;


Promise.all([
    faceapi.loadSsdMobilenetv1Model("..//models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("..//models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("..//models"),
    faceapi.loadTinyFaceDetectorModel("..//models"),
    console.log("All models are loaded")
]).then(drawDetections);

function drawDetections() {
    let minConfidence = 0.4 //parseFloat(document.getElementById('confidence').value);
    let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});
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
            //resize canvas
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            //clear canvas
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            //draw new canvas
            faceapi.draw.drawDetections(canvas, resizedDetections);
            //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            if (detections && detections.length > 0 && detections[0].detection.score > parseFloat(document.getElementById('confidence').value)) {
                await extractFaceFromBox(video, detections[0].detection.box);
                await addToImageList();
            }
        }, 100);
    });
}

async function extractFaceFromBox(input, box) {
    const regionsToExtract = [new faceapi.Rect(box.x, box.y - 80, box.width + 20, box.height + 90)];
    //Creating canvas array
    faceImages = await faceapi.extractFaces(input, regionsToExtract);
}

