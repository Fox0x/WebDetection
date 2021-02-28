app.register.controller("LiveCtrl", function () {
  Promise.all([
    faceapi.loadSsdMobilenetv1Model("../models"),
    faceapi.loadFaceLandmarkModel("../models"),
    faceapi.loadFaceRecognitionModel("../models"),
    faceapi.loadTinyFaceDetectorModel("../models"),
    loadVideo(),
  ]);

  //TODO: ------------------------------

  document.onunload = function (event) {
    console.log("Video closed");
    // 	  // Пауза
    // video.pause();
    // // Стоп
    // videoStream.getVideoTracks()[0].stop();
  };
});

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
        recognizeFace();
        canvas = document.getElementById("canvas");
        displaySize = {
          width: video.width,
          height: video.height,
        };
        canvas.style.left = video.getBoundingClientRect().x + "px";
        faceapi.matchDimensions(canvas, displaySize);
      });
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
    });
}

async function getDetection() {
  let detections = [];
  while (!detections.length) {
    detections = faceapi.resizeResults(
      await faceapi
        .detectAllFaces(video, options)
        .withFaceLandmarks()
        .withFaceDescriptors(),
      displaySize
    );
    if (canvas) {
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return detections;
}

async function getLabeledDescriptors() {
  if (!localStorage.length) {
    console.log("localStorage is empty");
    let detections = await getDetection();
    await detections.forEach(async (fd) => {
      await addNewUser(fd);
    });
  }
  await updateLabeledDescriptors();
  return labeledDescriptors;
}
let i = 1;
async function addNewUser(fd) {
  await extractFace(fd).then((imageURL) => {
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
    if (i <= 4) {
      document.getElementById("outputImage" + i).src = imageURL;
      document.getElementById("outputImage" + i).alt = JSON.stringify({
        timestamp: timeStamp,
        descriptor: fd.descriptor,
        score: fd.detection.score,
      });
      document.getElementById("form" + i).style.visibility = "visible";
      i++;
    } else {
      i = 1;
    }
  });
  await updateLabeledDescriptors();
}

async function recognizeFace() {
  labeledDescriptors = await getLabeledDescriptors();
  setInterval(async () => {
    if (labeledDescriptors.length) {
      faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
      //detecting all faces
      let detections = await getDetection();
      detections.forEach(async (fd) => {
        //find best match with first detection
        let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
        //If person is unknown
        if (bestMatch.label === "unknown") {
          await addNewUser(fd);
        } else {
          drawBox(
            canvas,
            fd,
            bestMatch.label +
              "  " +
              ((100 - bestMatch.distance * 100).toFixed(1) + "%")
          );
        }
      });
    } else getLabeledDescriptors();
  }, 100);
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
      firstName: document.getElementById('firstName' + param).value,
      lastName: document.getElementById('lastName' + param).value,
    })
  );
}