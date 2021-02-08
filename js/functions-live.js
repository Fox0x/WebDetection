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
//================================================//
//Image functions
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
//================================================//
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
//================================================//
//Detections func
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
        document.getElementById('video').addEventListener('playing', () => {
            const video = document.getElementById('video');
            getDetections(video);
        });
    }

    let minConfidence = 0.8;
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

    let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 2});

    function changeModel() {
        let model = document.getElementById('model');
        model.value === 'tinyFaceDetector' ?
            options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, scoreThreshold: minConfidence}) :
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
            const results = await faceapi.detectAllFaces(video, options);
            //resize canvas
            const resizedDetections = faceapi.resizeResults(results, displaySize);
            //clear canvas
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            resizedDetections.forEach(detection => {
                const label = "Person " + (resizedDetections.indexOf(detection) + 1) +
                    "  sc: " + detection.score.toFixed(2).toString();
                const drawBox = new faceapi.draw.DrawBox(detection.box, {label});
                drawBox.draw(canvas);
                extractFaceFromBox(video, detection.box)
            })
        }, 100);
    }
//================================================//