(function attachQuestPlatformUtils(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";
  var EARTH_RADIUS_MILES = 3958.7613;

  var CONTIGUOUS_US_OUTLINE = [
    { lng: -124.5, lat: 48.8 }, { lng: -123.3, lat: 46.2 }, { lng: -124.1, lat: 42.0 },
    { lng: -122.6, lat: 40.4 }, { lng: -121.2, lat: 38.2 }, { lng: -119.5, lat: 36.3 },
    { lng: -117.2, lat: 34.3 }, { lng: -114.8, lat: 32.7 }, { lng: -111.0, lat: 31.5 },
    { lng: -107.5, lat: 31.2 }, { lng: -104.1, lat: 29.9 }, { lng: -100.0, lat: 28.9 },
    { lng: -97.0, lat: 26.2 }, { lng: -93.8, lat: 28.8 }, { lng: -90.4, lat: 29.2 },
    { lng: -88.1, lat: 30.2 }, { lng: -85.0, lat: 29.8 }, { lng: -83.0, lat: 28.8 },
    { lng: -81.3, lat: 25.7 }, { lng: -80.1, lat: 26.8 }, { lng: -80.2, lat: 30.6 },
    { lng: -79.2, lat: 33.0 }, { lng: -77.2, lat: 35.2 }, { lng: -76.0, lat: 37.8 },
    { lng: -75.3, lat: 39.9 }, { lng: -74.0, lat: 40.8 }, { lng: -71.2, lat: 41.5 },
    { lng: -70.1, lat: 43.0 }, { lng: -69.0, lat: 45.0 }, { lng: -71.0, lat: 45.2 },
    { lng: -73.7, lat: 44.8 }, { lng: -76.8, lat: 43.8 }, { lng: -79.2, lat: 43.1 },
    { lng: -82.8, lat: 42.5 }, { lng: -84.8, lat: 46.0 }, { lng: -89.5, lat: 47.8 },
    { lng: -95.0, lat: 48.9 }, { lng: -104.0, lat: 48.9 }, { lng: -111.0, lat: 48.9 },
    { lng: -117.0, lat: 48.9 }, { lng: -124.5, lat: 48.8 }
  ];

  var US_REGION_LINES = [
    [{ lng: -122, lat: 37.2 }, { lng: -114.4, lat: 35.5 }, { lng: -107.2, lat: 34.2 }, { lng: -99.3, lat: 33.4 }, { lng: -91.2, lat: 34.0 }, { lng: -82.4, lat: 35.0 }],
    [{ lng: -121.5, lat: 42.5 }, { lng: -112.8, lat: 41.7 }, { lng: -104.0, lat: 41.5 }, { lng: -95.0, lat: 41.5 }, { lng: -86.2, lat: 41.8 }, { lng: -77.5, lat: 41.9 }],
    [{ lng: -119.8, lat: 46.0 }, { lng: -109.0, lat: 46.0 }, { lng: -98.0, lat: 45.4 }, { lng: -87.5, lat: 44.8 }, { lng: -77.0, lat: 43.8 }]
  ];

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

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

  function formatDate(value, options) {
    if (!value) return "";

    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", options || {
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
    return remainder ? hours + " hr " + remainder + " min" : hours + " hr";
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

  function projectLine(points, width, height, options) {
    return points.map(function mapPoint(point) {
      var projected = projectPoint(point, width, height, options);
      return projected.x.toFixed(1) + "," + projected.y.toFixed(1);
    }).join(" ");
  }

  function buildUsBasemap(width, height, options) {
    var settings = options || {};
    var outline = projectLine(CONTIGUOUS_US_OUTLINE, width, height, settings);
    var regionLines = US_REGION_LINES.map(function mapLine(points) {
      return projectLine(points, width, height, settings);
    });
    var coastStroke = safeColor(settings.coastStroke, "rgba(248,243,232,0.2)");
    var landFill = safeColor(settings.landFill, "rgba(248,243,232,0.05)");
    var regionStroke = safeColor(settings.regionStroke, "rgba(248,243,232,0.08)");

    return [
      '<g class="qp-map-basemap" aria-hidden="true">',
      '  <polygon class="qp-map-land" points="' + outline + '" fill="' + landFill + '" stroke="' + coastStroke + '" stroke-width="1.4" stroke-linejoin="round"></polygon>',
      regionLines.map(function mapRegion(line) {
        return '  <polyline class="qp-map-region" points="' + line + '" fill="none" stroke="' + regionStroke + '" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></polyline>';
      }).join(""),
      "</g>"
    ].join("");
  }

  function normalizeDate(value) {
    if (!value) return null;
    var date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function parseDateRange(value) {
    if (!value) return { start: null, end: null };

    if (Array.isArray(value)) {
      return {
        start: normalizeDate(value[0]),
        end: normalizeDate(value[1] || value[0])
      };
    }

    if (typeof value === "object") {
      return {
        start: normalizeDate(value.start || value.date),
        end: normalizeDate(value.end || value.start || value.date)
      };
    }

    return {
      start: normalizeDate(value),
      end: normalizeDate(value)
    };
  }

  var root = ensureRoot();
  root.utils = {
    distanceMiles: distanceMiles,
    formatDate: formatDate,
    minutesToReadable: minutesToReadable,
    escapeHtml: escapeHtml,
    safeToken: safeToken,
    safeColor: safeColor,
    projectPoint: projectPoint,
    projectLine: projectLine,
    buildUsBasemap: buildUsBasemap,
    normalizeDate: normalizeDate,
    parseDateRange: parseDateRange
  };
})(window);
