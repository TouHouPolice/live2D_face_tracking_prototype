// helper functions

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(
      /* function FrameRequestCallback */ callback,
      /* DOMElement Element */ element
    ) {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
window.cancelRequestAnimFrame = (function() {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout
  );
})();

// video support utility functions
export function supports_video() {
  return !!document.createElement("video").canPlayType;
}

export function supports_h264_baseline_video() {
  if (!supports_video()) {
    return false;
  }
  var v = document.createElement("video");
  return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}

export function supports_webm_video() {
  if (!supports_video()) {
    return false;
  }
  var v = document.createElement("video");
  return v.canPlayType('video/webm; codecs="vp8"');
}
