//Vars
let minConfidence = 0.4;
let options = new faceapi.SsdMobilenetv1Options({minConfidence, maxResults: 10});

//Detections func
let video;
let displaySize;
let canvas;
let faceMatcher;
let labeledDescriptors = [];

Promise.all([
    faceapi.loadSsdMobilenetv1Model('../models'),
    faceapi.loadFaceLandmarkModel('../models'),
    faceapi.loadFaceRecognitionModel('../models'),
    faceapi.loadTinyFaceDetectorModel('../models')
]).then(loadVideo).then(initVars);

function initVars() {
    console.log('initVars');
    displaySize = {width: video.width, height: video.height};
    canvas = document.getElementById('canvas');
    faceapi.matchDimensions(canvas, displaySize);
}

function loadVideo() {
    console.log('loadVideo');
    video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            video.addEventListener('playing', () => {
                canvas.style.left = video.getBoundingClientRect().x + 'px';
                //Change preloader to live.htm
                document.getElementById('spinner').remove();
                document.getElementById('content').style.visibility = 'visible';
                document.getElementById('form1').style.visibility = 'visible';
                //Get first detections
                localStorage.length ? matchFaces() : getDetections();
            })
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });
}

let i = 1;

//Adding image to image list
function addToImageList(face) {
    console.log('addToImageList')
    let box = face.detection.box
    faceapi.extractFaces(video, [new faceapi.Rect(box.x, box.y, box.width, box.height)])
        .then(res => {
            res.forEach(canvas => {
                if (i <= 4) {
                    document.getElementById('outputImage' + i).src = canvas.toDataURL();
                    document.getElementById('form' + i).style.visibility = 'visible';
                    i++;
                } else {
                    i = 1;
                }
            })
        })
}

async function getLabeledDescriptors() {
    console.log('getLabeledDescriptors')
    if (!labeledDescriptors.length) {
        if (!localStorage.length) {
            await getDetections();
        }
        // iterate localStorage
        for (let i = 0; i < localStorage.length; i++) {
            // set iteration key name
            const key = localStorage.key(i);
            // use key name to retrieve the corresponding value
            const value = Float32Array.from(localStorage.getItem(key).split(","), parseFloat);
            labeledDescriptors = []
            await labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(key, [value]));
        }
    }
    return labeledDescriptors;

    // console.log('Try to find labeledDescriptor')
    // if (!labeledDescriptors.length) {
    //     console.log('No labeled descriptors found, get from localStorage')
    //
    //         // iterate localStorage
    //         for (let i = 0; i < localStorage.length; i++) {
    //             // set iteration key name
    //             const key = localStorage.key(i);
    //             // use key name to retrieve the corresponding value
    //             const value = Float32Array.from(localStorage.getItem(key).split(","), parseFloat);
    //             labeledDescriptors = []
    //             labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(key, [value]));
    //         }
    //         return labeledDescriptors;
    // } else {
    //     console.log('Find labeled descriptors for these faces')
    //     return labeledDescriptors;
    // }
}

function setLabeledDescriptor(descriptor) {
    console.log('setLabeledDescriptor')
    //Adding new labeled descriptor
    labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(
            'person ' + (labeledDescriptors.length + 1),
            [descriptor]
        ));
    //and save to localStorage
    labeledDescriptors.forEach(ld => localStorage.setItem(ld.label, ld.descriptors));
    console.log('Labeled descriptors length ' + labeledDescriptors.length);
    console.log('localStorage length ' + localStorage.length);
}

async function getDetections() {
    console.log('getDetections')
    await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({minConfidence: 0.9}))
        .withFaceLandmarks().withFaceDescriptors()
        .then(resolve => {
            if (resolve.length) {
                console.log('Detect ' + resolve.length + ' faces');
                resolve.forEach(fd => {
                    //add each detected face to localStorage
                    setLabeledDescriptor(fd.descriptor);
                    //and to imageList
                    addToImageList(fd);
                    //then put it into faceMather
                    //faceMatcher = new faceapi.FaceMatcher(getLabeledDescriptors());
                    getLabeledDescriptors().then(faceMatcher = new faceapi.FaceMatcher(resolve));
                    matchFaces();
                });
            } else getDetections();
        });
}

async function matchFaces() {
    console.log('matchFaces');
    await getLabeledDescriptors().then(resolve => faceMatcher = new faceapi.FaceMatcher(resolve));
    //Every 100ms
    setInterval(async () => {
        //detecting all faces
        await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors().then(resolve => {
            //then clear canvas
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            //then for each detection ir result array
            resolve.forEach(fd => {
                //find best match with first detection
                let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0,5);
                //If person is unknown
                if (bestMatch.label === 'unknown') {
                    console.log(fd.detection.box)
                    //add to IL
                    addToImageList(fd);
                    //and create new labeledDescriptor
                    setLabeledDescriptor(fd.descriptor);
                    getLabeledDescriptors().then(resolve => faceMatcher = new faceapi.FaceMatcher(resolve));
                } else {
                    drawBox(canvas, fd, bestMatch.label + ' - ' + ((100 - bestMatch.distance * 100).toFixed(1) + '%'));
                }
            });
        });
    }, 100);
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
    const drawBox = new faceapi.draw.DrawBox(faceapi.resizeResults(face, displaySize).detection.box, {label});
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
    console.log('Model ' + options._name + ' with confidence ' + options._minConfidence);
}