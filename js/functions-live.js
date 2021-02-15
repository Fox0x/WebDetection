//Vars
let minConfidence = 0.8;
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
    displaySize = {width: video.width, height: video.height};
    canvas = document.getElementById('canvas');
    faceapi.matchDimensions(canvas, displaySize);

}

function loadVideo() {
    video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            video.addEventListener('playing', () => {
                //Get first detections
                getDetections()
                //Change preloader to live.htm
                document.getElementById('spinner').remove();
                document.getElementById('content').style.visibility = 'visible';
                document.getElementById('form1').style.visibility = 'visible';
            })
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });
}

let i = 1;

//Adding image to image list
function addToImageList(face) {
    console.log('add face to image list')
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

function getLabeledDescriptorsFromLocalStorage() {
    console.log('Try to find labeledDescriptor')
    if (labeledDescriptors.length === 0) {
        console.log('No labeled descriptors found, get from localStorage')
        // iterate localStorage
        for (let i = 0; i < localStorage.length; i++) {
            // set iteration key name
            const key = localStorage.key(i);
            // use key name to retrieve the corresponding value
            const value = Float32Array.from(localStorage.getItem(key).split(","), parseFloat);
            labeledDescriptors = []
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(key, [value]));
        }
        return labeledDescriptors;
    } else {
        console.log('Find labeled descriptors for these faces')
        return labeledDescriptors;
    }
}

function addNewLabeledDescriptor(descriptor) {
    console.log('Adding new labeled descriptor')
    //Adding new labeled descriptor
    labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(
            'person ' + (labeledDescriptors.length + 1),
            [descriptor]
        ));
    console.log('and save to localStorage')
    //and save to localStorage
    labeledDescriptors.forEach(ld => localStorage.setItem(ld.label, ld.descriptors));
}

function getDetections() {
    console.log('Trying find faces');
    faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({minConfidence: 0.9, maxResults: 4})).withFaceLandmarks().withFaceDescriptors()
        .then(resolve => {
            console.log('Detect ' + resolve.length + ' faces');
            //If got first detection
            if (resolve.length) {

                //and if localStorage is not empty
                if (localStorage.length) {

                    //get labeledDescriptor from localStorage, then put it into faceMather
                    faceMatcher = new faceapi.FaceMatcher(getLabeledDescriptorsFromLocalStorage());

                    //then call matchFace()
                    matchFaces(faceMatcher);

                    //and add each face to imageList
                    resolve.forEach(fd => addToImageList(fd))

                } else {
                    //If localStorage is empty
                    resolve.forEach(fd => {

                        //add each detected face to localStorage
                        addNewLabeledDescriptor(fd.descriptor);

                        //and to imageList
                        addToImageList(fd)

                        //then put it into faceMather
                        faceMatcher = new faceapi.FaceMatcher(getLabeledDescriptorsFromLocalStorage());

                        //and call matchFace().
                        matchFaces(faceMatcher);
                    });
                }

                //If faces are not detected, try again in loop.
            } else {
                getDetections();
            }
        });
}

function matchFaces(faceMatcher) {
    //Every 100ms
    setInterval(async () => {
        //detecting all faces
        faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors().then(resolve => {
            //then clear canvas
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

            //then for each detection ir result array
            resolve.forEach(fd => {
                //find best match with first detection
                const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
                //If person is unknown
                if (bestMatch.label.toString() === 'unknown') {
                    console.log('Unknown person detected')
                    //add to IL
                    addToImageList(fd);
                    //and create new labeledDescriptor
                    addNewLabeledDescriptor(fd.descriptor);
                    faceMatcher = new faceapi.FaceMatcher(getLabeledDescriptorsFromLocalStorage());
                } else {
                    drawBox(canvas, fd, bestMatch.toString());
                }
            });
        });
    }, 100);
}

//Draw canvas with any label
async function drawBox(canvas, face, label) {
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
    console.log(options._name)
}