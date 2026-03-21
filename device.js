/* device.js — MLB Ballparks Quest
   Shim that delegates to quest-platform shared device detection.
   Preserves BPQ.device and BPQ.viewport API exactly. */
(function attachDeviceModule(global) {
  "use strict";

  var QP = global.__QUEST_PLATFORM__;
  if (!QP || !QP.device) {
    throw new Error("Load quest-platform/shared/js/core/device.js before mlb device.js");
  }

  function initWhenReady() {
    QP.device.init(global.document);
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", initWhenReady, { once: true });
  } else {
    initWhenReady();
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.device = QP.device.detectDevice;
  global.BPQ.viewport = QP.device.detectViewport;
  global.BPQ.deviceApi = QP.device;
})(window);
