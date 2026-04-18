(function attachQuestPlatformDevice(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function detectDevice() {
    var ua = global.navigator.userAgent || "";
    var isIPad =
      /iPad/.test(ua) ||
      (global.navigator.platform === "MacIntel" && global.navigator.maxTouchPoints > 1);
    var isPhone = /iPhone|Android.*Mobile|BlackBerry|IEMobile/.test(ua);
    var hasTouch = global.navigator.maxTouchPoints > 0;
    var coarse = global.matchMedia("(pointer: coarse)").matches;
    var fine = global.matchMedia("(pointer: fine)").matches;
    var hover = global.matchMedia("(hover: hover)").matches;

    if (isIPad) return "ipad";
    if (isPhone) return "mobile";
    if (fine && hover && !hasTouch) return "desktop";
    if (coarse && hasTouch) return "touch";
    return "desktop";
  }

  function detectViewport() {
    var width = global.innerWidth;
    if (width >= 1200) return "xl";
    if (width >= 900) return "lg";
    if (width >= 640) return "md";
    return "sm";
  }

  function getLayout(device, viewport) {
    if (device === "ipad" || (device === "touch" && viewport === "lg")) return "ipad";
    if (device === "mobile" || viewport === "sm") return "mobile";
    return "desktop";
  }

  function applyDeviceAttributes(doc) {
    var documentRef = doc || global.document;
    var root = documentRef.documentElement;
    var body = documentRef.body;
    if (!body) return null;

    var device = detectDevice();
    var viewport = detectViewport();
    var layout = getLayout(device, viewport);

    [root, body].forEach(function apply(node) {
      node.dataset.device = device;
      node.dataset.viewport = viewport;
      node.dataset.layout = layout;
      if (!node.dataset.input) node.dataset.input = "default";
    });

    return { device: device, viewport: viewport, layout: layout };
  }

  function bindInputMode(doc) {
    var documentRef = doc || global.document;

    function setInputMode(value) {
      var root = documentRef.documentElement;
      var body = documentRef.body;
      if (root) root.dataset.input = value;
      if (body) body.dataset.input = value;
    }

    global.addEventListener("pointerdown", function onPointerDown(event) {
      if (event.pointerType === "pen") {
        setInputMode("pen");
        documentRef.dispatchEvent(new CustomEvent("penDetected", { detail: { pressure: event.pressure } }));
      } else if (event.pointerType === "touch") {
        setInputMode("touch");
      } else if (event.pointerType === "mouse") {
        setInputMode("mouse");
      }
    }, { passive: true });
  }

  function bindResizeRefresh(doc) {
    var documentRef = doc || global.document;
    var frame = null;

    global.addEventListener("resize", function onResize() {
      if (frame) global.cancelAnimationFrame(frame);
      frame = global.requestAnimationFrame(function refreshAttributes() {
        applyDeviceAttributes(documentRef);
      });
    });
  }

  function init(doc) {
    var documentRef = doc || global.document;
    applyDeviceAttributes(documentRef);
    bindInputMode(documentRef);
    bindResizeRefresh(documentRef);
  }

  var root = ensureRoot();
  root.device = {
    detectDevice: detectDevice,
    detectViewport: detectViewport,
    getLayout: getLayout,
    applyDeviceAttributes: applyDeviceAttributes,
    init: init
  };
})(window);
