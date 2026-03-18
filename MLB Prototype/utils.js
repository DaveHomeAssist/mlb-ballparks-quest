(function attachUtilsModule(global) {
  "use strict";

  var EARTH_RADIUS_MILES = 3958.7613;

  function toRadians(value) {
    return (Number(value) * Math.PI) / 180;
  }

  function distanceMiles(lat1, lng1, lat2, lng2) {
    var phi1 = toRadians(lat1);
    var phi2 = toRadians(lat2);
    var deltaPhi = toRadians(Number(lat2) - Number(lat1));
    var deltaLambda = toRadians(Number(lng2) - Number(lng1));

    var haversine =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    var angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return Number((EARTH_RADIUS_MILES * angularDistance).toFixed(1));
  }

  function formatDate(value) {
    if (!value) return "";

    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function minutesToReadable(totalMinutes) {
    var minutes = Number(totalMinutes);
    if (!Number.isFinite(minutes)) return "";
    if (minutes < 60) return Math.round(minutes) + " min";

    var hours = Math.floor(minutes / 60);
    var remainder = Math.round(minutes % 60);

    if (!remainder) {
      return hours + " hr";
    }

    return hours + " hr " + remainder + " min";
  }

  function projectPoint(coordinates, width, height, options) {
    var settings = options || {};
    var lng = coordinates && typeof coordinates.lng === "number" ? coordinates.lng : (settings.defaultLng != null ? settings.defaultLng : -95);
    var lat = coordinates && typeof coordinates.lat === "number" ? coordinates.lat : (settings.defaultLat != null ? settings.defaultLat : 39);
    var left = settings.left != null ? settings.left : 24;
    var top = settings.top != null ? settings.top : 18;
    var horizontalInset = settings.horizontalInset != null ? settings.horizontalInset : 48;
    var verticalInset = settings.verticalInset != null ? settings.verticalInset : 36;
    var minLng = settings.minLng != null ? settings.minLng : -125;
    var lngSpan = settings.lngSpan != null ? settings.lngSpan : 59;
    var minLat = settings.minLat != null ? settings.minLat : 25;
    var latSpan = settings.latSpan != null ? settings.latSpan : 24;

    return {
      x: left + ((lng - minLng) / lngSpan) * (width - horizontalInset),
      y: top + (1 - ((lat - minLat) / latSpan)) * (height - verticalInset)
    };
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  function safeToken(value, fallback) {
    var token = String(value == null ? "" : value).trim();
    if (/^[a-z0-9_-]+$/i.test(token)) return token;
    return fallback || "";
  }

  function safeColor(value, fallback) {
    var color = String(value == null ? "" : value).trim();
    if (/^#[0-9a-f]{3,8}$/i.test(color)) return color;
    if (/^rgb(a)?\([\d\s.,%]+\)$/i.test(color)) return color;
    return fallback || "#0F1F38";
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.utils = {
    distanceMiles: distanceMiles,
    formatDate: formatDate,
    minutesToReadable: minutesToReadable,
    projectPoint: projectPoint,
    escapeHtml: escapeHtml,
    safeToken: safeToken,
    safeColor: safeColor
  };
})(window);
