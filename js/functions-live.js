//Vars
let isDetectionScoreShow = false;
let minConfidence = 0.8;
let options = new faceapi.SsdMobilenetv1Options({
	minConfidence,
	maxResults: 10,
});

//Detections func
let video;
let displaySize;
let canvas;
let faceMatcher;

Promise.all([
		faceapi.loadSsdMobilenetv1Model("../models"),
		faceapi.loadFaceLandmarkModel("../models"),
		faceapi.loadFaceRecognitionModel("../models"),
		faceapi.loadTinyFaceDetectorModel("../models"),
	])
	.then(loadVideo)
	.then(initVars);

function loadVideo() {
	video = document.querySelector("video");
	navigator.mediaDevices
		.getUserMedia({
			video: true,
			audio: false
		})
		.then(function (stream) {
			video.srcObject = stream;
			video.play();
			video.addEventListener("playing", () => {
				canvas.style.left = video.getBoundingClientRect().x + "px";
				//Change preloader to live.htm
				document.getElementById("spinner").remove();
				document.getElementById("content").style.visibility = "visible";
				matchFaces();
			});
		})
		.catch(function (err) {
			console.log("An error occurred: " + err);
		});
}

function initVars() {
	displaySize = {
		width: video.width,
		height: video.height
	};
	canvas = document.getElementById("canvas");
	faceapi.matchDimensions(canvas, displaySize);
}

async function extractCanvas(face) {
	let canvas;
	let box = face.detection.box;
	await faceapi
		.extractFaces(video, [
			new faceapi.Rect(box.x, box.y, box.width, box.height),
		])
		.then((resolve) => {
			resolve.forEach((resolve) => {
				canvas = resolve;
			});
		});
	return canvas.toDataURL();
}

async function addNewUser(faces) {

	faces.forEach(async (face) => {
		let imgURL;
		await extractCanvas(face).then((resolve) => {
			imgURL = resolve.toDataURL();
		});
		let i = users.length + 1;
		users.push({
			label: "person " + i,
			image: imgURL,
			score: face.detection.score,
			created: new Date().toLocaleString(),
			descriptor: new faceapi.LabeledFaceDescriptors("person " + i, [
				face.descriptor,
			]),
		});
	})
	showReturnedVal(users)
	users.forEach((user) =>
		localStorage.setItem(user.label, JSON.stringify(user))
	);
}




async function getDetections() {
	await faceapi
		.detectAllFaces(
			video,
			new faceapi.SsdMobilenetv1Options({
				minConfidence: 0.9
			})
		)
		.withFaceLandmarks()
		.withFaceDescriptors()
		.then((fd) => {
			console.log(fd)
			if (fd.length > 0) {
				console.log(fd + '---')
				return fd;
			} else getDetections();

		});
}

async function getLabeledDescriptors() {
	// console.log('getUsers()');
	if (!users.length) {
		if (!localStorage.length) {
			await getDetections().then(resolve => {
				console.log(resolve)
			})
		}


		for (let i = 0; i < localStorage.length; i++) {
			showReturnedVal(JSON.parse(localStorage.getItem("person " + (i + 1))))
			users.push(JSON.parse(localStorage.getItem("person " + (i + 1))));
		}
	}
	console.log(users);
	return users;
}


async function getLabeledDescriptors() {
	// console.log('getLabeledDescriptors()')
	if (!labeledDescriptors.length) {
		await getLabeledDescriptors().then((resolve) => {
			users.forEach((resolve) => {
				let descriptor = Float32Array.from(resolve.descriptor.descriptors.toString().split(","), parseFloat);
				let label = "person " + (labeledDescriptors.length + 1);
				labeledDescriptors.push(
					new faceapi.LabeledFaceDescriptors(label, [descriptor])
				);
			});
		});
	}
	console.log(labeledDescriptors)
	return labeledDescriptors;
}

async function matchFaces() {
	// console.log('matchFaces()')
	await getLabeledDescriptors().then(
		(resolve) => {
			console.log(resolve);
			faceMatcher = new faceapi.FaceMatcher(resolve)
		}
	);
	//Every 100ms
	setInterval(async () => {
		//detecting all faces
		await faceapi
			.detectAllFaces(video, options)
			.withFaceLandmarks()
			.withFaceDescriptors()
			.then((resolve) => {
				//then clear canvas
				canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
				//then for each detection ir result array
				resolve.forEach((fd) => {
					showDetectionScore(fd);
					//find best match with first detection
					let bestMatch = faceMatcher.findBestMatch(fd.descriptor, 0.5);
					//If person is unknown
					if (bestMatch.label === "unknown") {
						addNewUser(fd);
					} else {
						drawBox(canvas, fd, bestMatch.label + "  " + ((100 - bestMatch.distance * 100).toFixed(1) + "%"));
					}
				});
			});
	}, 100);
}

function showDetectionScore(fd) {
	if (isDetectionScoreShow) {
		console.log(fd.detection.score);
	}
}

//Draw canvas with any label
function drawBox(canvas, face, label) {
	const drawBox = new faceapi.draw.DrawBox(
		faceapi.resizeResults(face, displaySize).detection.box, {
			label
		}
	);
	drawBox.draw(canvas);
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
	model.value === "tinyFaceDetector" ?
		(options = new faceapi.TinyFaceDetectorOptions({
			inputSize: 160,
			scoreThreshold: minConfidence,
		})) :
		(options = new faceapi.SsdMobilenetv1Options({
			minConfidence,
			maxResults: 10,
		}));
	console.log(
		"Model " + options._name + " with confidence " + options._minConfidence
	);
}