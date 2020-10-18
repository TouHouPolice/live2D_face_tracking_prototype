import {
  supports_video,
  supports_h264_baseline_video,
  supports_webm_video
} from "./libs/utils";

import "./styles/main.css";
import "./styles/bootstrap.min.css";

var vid = document.getElementById("videoInput");

var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById("overlay");
var overlayCC = overlay.getContext("2d");

var ctracker = new clm.tracker();

var trackingStarted = false;

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

if (navigator.mediaDevices) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(gumSuccess)
    .catch(gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({ video: true }, gumSuccess, gumFail);
} else {
  alert(
    "Your browser does not seem to support getUserMedia, using a fallback video instead."
  );
}

function positionLoop() {
  requestAnimFrame(positionLoop);
  var positions = ctracker.getCurrentPosition();
  // do something with the positions ...
  // print the positions
  var positionString = "";

  if (positions) {
    positions.forEach((p, index) => {
      positionString +=
        "Point " +
        index +
        " : [" +
        p[0].toFixed(2) +
        "," +
        p[1].toFixed(2) +
        "]<br/>";
    });
    document.getElementById("positions").innerHTML = positionString;
  }
}

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, overlay.width, overlay.height);
  ctracker.draw(overlay);
}

function adjustVideoProportions() {
  // resize overlay and video if proportions of video are not 4:3
  // keep same height, just change width
  var proportion = vid.videoWidth / vid.videoHeight;
  vid_width = Math.round(vid_height * proportion);
  vid.width = vid_width;
  overlay.width = vid_width;
}

function gumSuccess(stream) {
  // add camera stream if getUserMedia succeeded
  if ("srcObject" in vid) {
    vid.srcObject = stream;
    vid.play();
    ctracker.init();
    ctracker.start(vid);
    trackingStarted = true;
    drawLoop();
    positionLoop();
  } else {
    vid.src = window.URL && window.URL.createObjectURL(stream);
  }
  vid.onloadedmetadata = function() {
    adjustVideoProportions();
    vid.play();
  };
  vid.onresize = function() {
    adjustVideoProportions();
    if (trackingStarted) {
      ctracker.stop();
      ctracker.reset();
      ctracker.start(vid);
    }
  };
}

function gumFail() {
  // fall back to video if getUserMedia failed

  alert(
    "There was some problem trying to fetch video from your webcam, using a fallback video instead."
  );
}
