'use strict';

let isPhotoPicked = [false, false, false, false];

async function extractFaceFromBox(input, box) {
    const regionsToExtract = [new faceapi.Rect(box.x -50 , box.y -90, box.width + 50, box.height + 50)];
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
                    document.getElementById('outputImage' + i).src = canvas.toDataURL();
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
    console.log(isPhotoPicked);
}

function increaseConfidence() {
    let confidence = parseFloat(document.getElementById('confidenceOutput').value);
    confidence = Math.min(faceapi.utils.round(confidence + 0.1), 1.0);
    document.getElementById('confidenceOutput').value = confidence;
    console.log(confidence);
}

function decreaseConfidence() {
    let confidence = parseFloat(document.getElementById('confidenceOutput').value);
    confidence = Math.max(faceapi.utils.round(confidence - 0.1), 0.1);
    document.getElementById('confidenceOutput').value = confidence;
    console.log(confidence);
}