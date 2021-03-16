app.register.controller("VListCtrl", function ($scope) {
    if (document.getElementById("spinner") !== null) {
        document.getElementById("spinner").style.visibility = "hidden";
    }
    document.getElementById("content").style.visibility = "visible";
    if (typeof videoStream !== 'undefined') {
        video.pause();
        videoStream.getVideoTracks()[0].stop();
    }
});