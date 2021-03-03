Promise.all([
  faceapi.loadTinyFaceDetectorModel("../models"),
  faceapi.loadFaceLandmarkModel("../models"),
  faceapi.loadFaceRecognitionModel("../models"),
  faceapi.loadSsdMobilenetv1Model("../models"),
]).then(loadVideo());

let video;
let videoStream;
let canvas;
let minConfidence = 0.6;
let options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 160,
  scoreThreshold: minConfidence,
});
let displaySize;

function loadVideo() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then(function (stream) {
      videoStream = stream;
      video = document.getElementById("video");
      video.srcObject = videoStream;
      video.play();
      video.addEventListener("playing", () => {
        if (document.getElementById("spinner") !== null) {
          document.getElementById("spinner").style.visibility = "hidden";
        }
        document.getElementById("content").style.visibility = "visible";
        canvas = document.getElementById("canvas");
        displaySize = {
          width: video.width,
          height: video.height,
        };
        canvas.style.left = video.getBoundingClientRect().x + "px";
        faceapi.matchDimensions(canvas, displaySize);
        getDetection();
      });
    })
    .catch(function (err) {
      new bootstrap.Modal(document.getElementById("cameraAlertModal"), {
        focus: true,
      }).show();
      console.log("An error occurred: " + err);
    });
}
async function showAddNewUserModal(fd) {
  video.pause();
  videoStream.getVideoTracks()[0].stop();
  new bootstrap.Modal(document.getElementById("addUserModal"), {
    focus: true,
  }).show();
  document.getElementById("modalUserImage").src = await extractFace(fd);
  document.getElementById("modalTimestamp").value = new Date().toLocaleString();
  document.getElementById("modalScore").value = fd.detection.score.toFixed(2);
}

async function getDetection() {
  return new Promise(async (resolve) => {
    let resizedDetections = faceapi.resizeResults(
      await faceapi
        .detectAllFaces(video, options)
        .withFaceLandmarks()
        .withFaceDescriptors(),
      displaySize
    );
    resizedDetections.length && resolve(resizedDetections);
  });
}

async function getLabeledDescriptors() {
  if (!localStorage.length) {
    console.log("localStorage is empty");
    let detections = await getDetection();
    await detections.forEach((fd) => {
      await addNewUser(fd);
    });
  }
  await updateLabeledDescriptors();
  return labeledDescriptors;
}

async function addNewUser(fd) {
  extractFace(fd).then((imageURL) => {
    const timeStamp = new Date().toLocaleString();
    localStorage.setItem(
      timeStamp,
      JSON.stringify({
        image: imageURL,
        descriptor: fd.descriptor,
        score: fd.detection.score,
        firstName: "",
        lastName: "",
      })
    );
  });
  await updateLabeledDescriptors();
}

async function recognizeFace() {
  getLabeledDescriptors().then((labeledDescriptors) => {
    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    getDetection().then((detections) => {
      detections.map((fd) => {
        let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
        bestMatch.label !== "unknown"
          ? addNewUser(fd)
          : drawBox(
              canvas,
              fd,
              bestMatch.label +
                "  " +
                ((100 - bestMatch.distance * 100).toFixed(1) + "%")
            );
      });
    });
  });
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
  const drawBox = new faceapi.draw.DrawBox(
    faceapi.resizeResults(face, displaySize).detection.box,
    {
      label,
    }
  );
  drawBox.draw(canvas);
}

//return url from a faceDetection
async function extractFace(face) {
  let canvas;
  let box = face.detection.box;
  await faceapi
    .extractFaces(video, [
      new faceapi.Rect(box.x - 70, box.y - 90, box.width + 70, box.height + 90),
    ])
    .then((resolve) => {
      resolve.forEach((resolve) => {
        canvas = resolve;
      });
    });
  return canvas.toDataURL();
}

//Controllers func
function increaseConfidence() {
  minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 0.9);
  document.getElementById("confidenceOutput").value = minConfidence;
  changeModel();
}

function decreaseConfidence() {
  minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1);
  document.getElementById("confidenceOutput").value = minConfidence;
  changeModel();
}

function changeModel() {
  let model = document.getElementById("model");
  model.value === "tinyFaceDetector"
    ? (options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: minConfidence,
      }))
    : (options = new faceapi.SsdMobilenetv1Options({
        minConfidence,
        maxResults: 10,
      }));
  console.log(
    "Model " + options._name + " with confidence " + options._minConfidence
  );
}

function onClickSend(param) {
  const image = JSON.parse(document.getElementById("outputImage" + param).alt);
  localStorage.setItem(
    image.timestamp,
    JSON.stringify({
      image: document.getElementById("outputImage" + param).src,
      descriptor: image.descriptor,
      score: image.score,
      firstName: document.getElementById("firstName" + param).value,
      lastName: document.getElementById("lastName" + param).value,
    })
  );
}
