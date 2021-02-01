navigator.getUserMedia(
    {video: {}},
    stream => (document.getElementById("video").srcObject = stream),
    err => console.error(err)
);