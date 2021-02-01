'use strict';

let imageList = [
    {
        src: "img/user.png",
        detections: undefined
    },
    {
        src: "img/user.png",
        detections: undefined
    },
    {
        src: "img/user.png",
        detections: undefined
    },
    {
        src: "img/user.png",
        detections: undefined
    }
];

document.addEventListener('DOMContentLoaded',  () => {
    for (let i = 1; i <= 4; i++) {
        let imageId = "outputImage" + i;
        document.getElementById(imageId).src = imageList[i-1].src;
    }
});