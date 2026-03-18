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

  global.BPQ = global.BPQ || {};
  global.BPQ.utils = {
    distanceMiles: distanceMiles,
    formatDate: formatDate,
    minutesToReadable: minutesToReadable
  };
})(window);
