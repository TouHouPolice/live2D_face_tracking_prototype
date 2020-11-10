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

export var headAngleX;
export var headAngleY;
export var headAngleZ;

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
    // positions.forEach((p, index) => {
    //   positionString +=
    //     "Point " +
    //     index +
    //     " : [" +
    //     p[0].toFixed(2) +
    //     "," +
    //     p[1].toFixed(2) +
    //     "]<br/>";
    // });
    // document.getElementById("positions").innerHTML = positionString;

    positions.forEach((p, index) => {
      if (index === 33 || index === 62 || index === 7) {
        positionString +=
          "Point " +
          index +
          " : [" +
          p[0].toFixed(2) +
          "," +
          p[1].toFixed(2) +
          "]<br/>";
      }
    });
    headAngleX = getHeadAngleX(positions[7], positions[33], positions[62]);
    headAngleZ = getHeadAngleZ(positions[0], positions[14]);
    headAngleY = getHeadAngleY(
      positions[0],
      positions[14],
      positions[62],
      ctracker.getCurrentScaling()
    );
    positionString += "HeadAngleX " + headAngleX + "<br/>";
    positionString += "HeadAngleY " + headAngleY + "<br/>";
    positionString += "HeadAngleZ " + headAngleZ + "<br/>";

    document.getElementById("positions").innerHTML = positionString;
    //console.log(ctracker.getCurrentScaling());
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

function angleBetweenVectors(vector1, vector2) {
  var angle =
    Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]);
  return radians_to_degrees(angle);
}

function getHeadAngleX(p7, p33, p62) {
  var vector1 = [p7[0] - p33[0], p7[1] - p33[1]];
  var vector2 = [p62[0] - p33[0], p62[1] - p33[1]];
  var angle = angleBetweenVectors(vector1, vector2);

  return angle;
}

function getHeadAngleZ(p0, p14) {
  var vector1 = [1000, 0];
  var vector2 = [p14[0] - p0[0], p14[1] - p0[1]];

  var angle = angleBetweenVectors(vector1, vector2);

  return angle;
}

function getHeadAngleY(p0, p14, p62, scaling) {
  var midPoint = [(p0[0] + p14[0]) / 2, (p0[1] + p14[1]) / 2];
  var defaultLength = 50 / 2.65;
  var currentLength = distance_between_two_points(midPoint, p62) / scaling;

  // console.log(defaultLength);
  // var currentLength = distance_between_two_points(p33, p62) / scaling;
  var ratio = defaultLength / currentLength;
  var angle;
  if (ratio >= 1) {
    angle = (ratio - 1) * 20;
  } else {
    angle = (ratio - 1) * 120;
  }
  // var angle = (ratio - 1) * 300;

  return angle;
}

function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

function distance_between_two_points(p1, p2) {
  var a = p1[0] - p2[0];
  var b = p1[1] - p2[1];
  var distance = Math.sqrt(a * a + b * b);
  return distance;
}
