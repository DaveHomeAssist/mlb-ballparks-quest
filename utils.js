/* utils.js — MLB Ballparks Quest
   Shim that delegates to quest-platform shared utils.
   Preserves BPQ.utils API and exposes the expanded shared helpers. */
(function attachUtilsModule(global) {
  "use strict";

  var QP = global.__QUEST_PLATFORM__;
  if (!QP || !QP.utils) {
    throw new Error("Load quest-platform/shared/js/core/utils.js before mlb utils.js");
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.utils = {
    distanceMiles: QP.utils.distanceMiles,
    formatDate: QP.utils.formatDate,
    minutesToReadable: QP.utils.minutesToReadable,
    projectPoint: QP.utils.projectPoint,
    escapeHtml: QP.utils.escapeHtml,
    safeToken: QP.utils.safeToken,
    safeColor: QP.utils.safeColor,
    projectLine: QP.utils.projectLine,
    buildUsBasemap: QP.utils.buildUsBasemap,
    normalizeDate: QP.utils.normalizeDate,
    parseDateRange: QP.utils.parseDateRange
  };
})(window);
