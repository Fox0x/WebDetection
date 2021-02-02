'use strict';

let isPhotoPicked = [false, false, false, false]

let i = 1;
async function addToImageList() {
    await faceImages.forEach(canvas => {
        if (i <= 4) {
            if (canvas.toDataURL() !== null) {
                document.getElementById('outputImage' + i).src = canvas.toDataURL();
                document.getElementById('outputImage' + i).alt = detections[0].descriptor;
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
    isPhotoPicked[imageId-1] = true;
    console.log(isPhotoPicked);
}

function increaseConfidence () {
    let confidence = parseFloat(document.getElementById('confidenceOutput').value);
    confidence = Math.min(faceapi.utils.round(confidence + 0.1), 1.0);
    document.getElementById('confidenceOutput').value = confidence;
    console.log(confidence);
}

function decreaseConfidence () {
    let confidence = parseFloat(document.getElementById('confidenceOutput').value);
    confidence = Math.max(faceapi.utils.round(confidence - 0.1), 0.1);
    document.getElementById('confidenceOutput').value = confidence;
    console.log(confidence);
}