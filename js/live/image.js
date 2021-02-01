'use strict';
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