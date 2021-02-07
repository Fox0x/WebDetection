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
    myForm[imageId - 1].image = document.getElementById('outputImage' + imageId).src;
    console.log(isPhotoPicked);
    console.log(myForm[imageId - 1].image);
}