(function attachRoutePage(global) {
  "use strict";

  var app = global.BPQ && global.BPQ.app;
  if (!app) return;

  var tripScratchpadEl = document.getElementById("tripScratchpad");
  var tripNotesContextEl = document.getElementById("tripNotesContext");
  var tripSummaryCardEl = document.getElementById("tripSummaryCard");
  var routeGridEl = document.getElementById("routeGrid");
  var routeMapPanelEl = document.getElementById("routeMapPanel");
  var logisticsGridEl = document.getElementById("logisticsGrid");

  var DATE_RE = /\b(?:(?:Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat|Sun)(?:day)?\.?\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,\s*\d{4})?\b|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/i;
  var PRICE_LINE_RE = /\$\s?\d+(?:\.\d{2})?(?:[^\n]*)/i;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function splitNoteLines(text) {
    return normalizeText(text)
      .split(/\n+/)
      .map(function mapLine(line) { return line.trim(); })
      .filter(Boolean);
  }

  function findDateLine(lines, text) {
    var matchedLine = lines.find(function findLine(line) {
      return DATE_RE.test(line);
    });
    if (matchedLine) return matchedLine.match(DATE_RE)[0];
    var inlineMatch = normalizeText(text).match(DATE_RE);
    return inlineMatch ? inlineMatch[0] : "";
  }

  function findPriceLine(lines, text) {
    var matchedLine = lines.find(function findLine(line) {
      return PRICE_LINE_RE.test(line);
    });
    if (matchedLine) return matchedLine.match(PRICE_LINE_RE)[0].trim();
    var inlineMatch = normalizeText(text).match(PRICE_LINE_RE);
    return inlineMatch ? inlineMatch[0].trim() : "";
  }

  function titleCaseLine(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function findScratchWarning(lines) {
    var warningLine = lines.find(function findLine(line) {
      return /\b(?:avoid|watch|skip|crowded|traffic|surge)\b/i.test(line);
    });
    return warningLine ? titleCaseLine(warningLine) : "";
  }

  function deriveEventWarning(park) {
    var events = Array.isArray(park.specialEvents) ? park.specialEvents : [];
    var lowerEvents = events.map(function mapEvent(eventName) {
      return String(eventName).toLowerCase();
    });

    if (lowerEvents.some(function hasFireworks(value) { return value.indexOf("fireworks") >= 0; })) {
      return "Avoid Friday, fireworks";
    }
    if (lowerEvents.some(function hasGiveaway(value) {
      return value.indexOf("giveaway") >= 0 || value.indexOf("bobblehead") >= 0 || value.indexOf("jersey") >= 0 || value.indexOf("replica") >= 0;
    })) {
      return "Giveaway night, buy ahead";
    }
    if (lowerEvents.some(function hasOpening(value) {
      return value.indexOf("opening") >= 0 || value.indexOf("premium") >= 0 || value.indexOf("postseason") >= 0 || value.indexOf("milestone") >= 0;
    })) {
      return "Premium date, buy ahead";
    }
    return "";
  }

  function extractAnchor(text) {
    var lines = splitNoteLines(text);
    return {
      date: findDateLine(lines, text),
      price: findPriceLine(lines, text),
      warning: findScratchWarning(lines)
    };
  }

  function getTicketBadge(ticketApproach) {
    var source = normalizeText(ticketApproach).toLowerCase();
    if (/easy to buy late|buyable late|last minute|short notice|soften quickly|usually available|strong value|good value|healthy|spontaneous|reachable/.test(source)) {
      return { label: "Walk up safe", tone: "safe" };
    }
    if (/buy early|buy ahead|high demand|premium|move quickly|tighten quickly|spike|runs hotter|marquee|rival|expensive/.test(source)) {
      return { label: "Buy ahead", tone: "ahead" };
    }
    return { label: "Check market", tone: "watch" };
  }

  function getRouteSelection() {
    return app.getRouteParks();
  }

  function renderEmptyState(title, text) {
    return [
      '<div class="route-empty fade-up fade-up-2">',
      '  <div class="route-empty-title">' + escapeHtml(title) + '</div>',
      text ? '  <div class="route-empty-text">' + escapeHtml(text) + '</div>' : '',
      '  <div class="route-empty-actions">',
      '    <a href="parks.html" class="btn btn-browse">Browse all 30 parks</a>',
      '    <a href="index.html" class="btn btn-ghost">Back to home</a>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function renderDemoLegCard() {
    return [
      '<section class="leg-card leg-card-demo fade-up fade-up-3">',
      '  <div class="leg-warning">Friday fireworks · avoid</div>',
      '  <div class="leg-header">',
      '    <div>',
      '      <div class="leg-title">PNC Park</div>',
      '      <div class="leg-subtitle">Good weekend trip</div>',
      '    </div>',
      '    <div class="leg-date-chip">Sat May 16</div>',
      '  </div>',
      '  <div class="anchor-block">',
      '    <div class="anchor-label">Key call</div>',
      '    <div class="anchor-line">Sat May 16</div>',
      '    <div class="anchor-line">$57 first base side</div>',
      '  </div>',
      '  <div class="signal-block">',
      '    <div class="signal-strip">',
      '      <span class="signal-pill">5h 15m drive</span>',
      '      <span class="signal-pill">Walkable from downtown</span>',
      '    </div>',
      '  </div>',
      '  <div class="ticket-badge safe">Walk up safe</div>',
      '  <div class="leg-scratch-shell">',
      '    <label class="leg-scratch-label">Notes</label>',
      '    <div class="leg-note-list">',
      '      <div>Friday drive out</div>',
      '      <div>Saturday game</div>',
      '      <div>Sunday home</div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function getRouteContextLine(routeParks) {
    if (!routeParks.length) return "No stops locked yet";
    if (routeParks.length === 1) return routeParks[0].city + " on deck";
    return routeParks[0].city + " to " + routeParks[routeParks.length - 1].city + " · " + routeParks.length + " stops in play";
  }

  function projectPoint(coordinates, width, height) {
    var lng = coordinates && typeof coordinates.lng === "number" ? coordinates.lng : -95;
    var lat = coordinates && typeof coordinates.lat === "number" ? coordinates.lat : 39;
    var x = 48 + ((lng + 125) / 59) * (width - 96);
    var y = 34 + (1 - ((lat - 25) / 24)) * (height - 68);
    return { x: x, y: y };
  }

  function renderMapPanel(routeParks, activeTrip) {
    var width = 760;
    var height = 260;
    var usableParks = routeParks.filter(function filterPark(park) {
      return park && park.coordinates && typeof park.coordinates.lat === "number" && typeof park.coordinates.lng === "number";
    });
    var points = usableParks.map(function mapPark(park) {
      return {
        park: park,
        point: projectPoint(park.coordinates, width, height)
      };
    });
    var linePoints = points.map(function mapPoint(entry) {
      return entry.point.x.toFixed(1) + "," + entry.point.y.toFixed(1);
    }).join(" ");
    var mapTitle = activeTrip.legs.length ? "Route map" : "Route map";
    var mapKicker = activeTrip.legs.length ? activeTrip.legs.length + " live legs" : "Waiting on the first stop";

    routeMapPanelEl.innerHTML = [
      '<div class="route-map-head">',
      '  <div>',
      '    <div class="section-label trip-notes-label">Route map</div>',
      '    <div class="route-map-title">' + escapeHtml(mapTitle) + '</div>',
      '  </div>',
      '  <div class="route-map-kicker">' + escapeHtml(mapKicker) + '</div>',
      '</div>',
      '<div class="route-map-frame">',
      '  <svg class="route-map-svg" viewBox="0 0 ' + width + ' ' + height + '" aria-label="Route map preview">',
      '    <path class="route-map-base" d="M110 58 L188 42 L258 55 L332 36 L429 45 L518 74 L601 87 L646 140 L616 188 L530 214 L400 224 L296 210 L180 196 L118 162 L96 118 Z"></path>',
      '    <path class="route-map-grid" d="M124 84 L628 84"></path>',
      '    <path class="route-map-grid" d="M110 144 L640 144"></path>',
      '    <path class="route-map-grid" d="M180 54 L150 210"></path>',
      '    <path class="route-map-grid" d="M342 42 L318 220"></path>',
      '    <path class="route-map-grid" d="M532 66 L516 214"></path>',
      (linePoints ? '    <polyline class="' + (points.length > 1 ? 'route-map-line' : 'route-map-line-muted') + '" points="' + escapeHtml(linePoints) + '"></polyline>' : ''),
      points.map(function mapPoint(entry, index) {
        var point = entry.point;
        return [
          '    <circle class="route-map-dot" cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="' + (index === 0 ? '7' : '6') + '" fill="' + escapeHtml(entry.park.color || "#7EB4E0") + '"></circle>',
          '    <text class="route-map-label" x="' + (point.x + 10).toFixed(1) + '" y="' + (point.y - 10).toFixed(1) + '">' + escapeHtml(entry.park.city) + '</text>'
        ].join("");
      }).join(""),
      '  </svg>',
      (!activeTrip.legs.length ? [
        '  <div class="route-map-empty-copy">',
        '    <div class="route-map-empty-title">Add your first park to start the route</div>',
        '  </div>'
      ].join("") : ''),
      '</div>'
    ].join("");
  }

  function renderTripSummary() {
    var trip = app.getActiveTrip();
    var routeParks = getRouteSelection();
    var firstPark = routeParks[0] || null;
    var visitedOnRoute = routeParks.filter(function countVisited(park) {
      return app.isVisited(park.id);
    }).length;

    tripSummaryCardEl.innerHTML = [
      '<div class="route-summary-item">',
      '  <div class="route-summary-label">Route title</div>',
      '  <div class="route-summary-value route-summary-text">' + escapeHtml(trip.title || "Current trip") + '</div>',
      '</div>',
      '<div class="route-summary-item">',
      '  <div class="route-summary-label">Stops</div>',
      '  <div class="route-summary-value">' + routeParks.length + '</div>',
      '</div>',
      '<div class="route-summary-item">',
      '  <div class="route-summary-label">Legs</div>',
      '  <div class="route-summary-value">' + trip.legs.length + '</div>',
      '</div>',
      '<div class="route-summary-item">',
      '  <div class="route-summary-label">Visited on route</div>',
      '  <div class="route-summary-value">' + visitedOnRoute + '</div>',
      '</div>',
      '<div class="route-summary-item">',
      '  <div class="route-summary-label">Starting point</div>',
      '  <div class="route-summary-value route-summary-text">' + escapeHtml(firstPark ? firstPark.name : "Still choosing") + '</div>',
      '</div>'
    ].join("");

    tripScratchpadEl.value = (app.getTripScratchpad() && app.getTripScratchpad().text) || "";
    tripNotesContextEl.textContent = getRouteContextLine(routeParks);
  }

  function renderRouteCards() {
    var routeParks = getRouteSelection();
    var routeStopIds = app.getRouteStore().stops;
    var activeTrip = app.getActiveTrip();

    if (!routeParks.length) {
      routeGridEl.innerHTML = renderEmptyState("No stops yet. Start with a park.", "");
      return;
    }

    routeGridEl.innerHTML = routeParks.map(function mapPark(park, index) {
      var onRoute = routeStopIds.includes(park.id);
      var visitMeta = app.getVisitedMeta(park.id);
      var visited = Boolean(visitMeta);
      var stopIndex = routeStopIds.indexOf(park.id);
      var priorLeg = stopIndex > 0 ? activeTrip.legs.find(function findLeg(leg) {
        return leg.toParkId === park.id;
      }) : null;

      return [
        '<article class="route-card fade-up fade-up-' + Math.min(index + 2, 5) + '">',
        '  <div class="route-card-stripe" style="background:' + park.color + ';"></div>',
        '  <div class="route-card-inner">',
        '    <div class="route-card-top">',
        '      <div>',
        '        <div class="route-park-name">' + escapeHtml(park.name) + '</div>',
        '        <div class="route-team-city">' + escapeHtml(park.team) + ' · ' + escapeHtml(park.city) + '</div>',
        '      </div>',
        '      <div class="tier-stamp tier-' + park.tier + '">' + escapeHtml(park.tier) + '</div>',
        '    </div>',
        '    <div class="route-reason">' + escapeHtml(park.note) + '</div>',
        '    <div class="route-card-footer">',
        '      <div class="route-card-metrics">',
        '        <div class="route-meta-pair"><span class="route-meta-label">Leg in</span><span class="route-meta-value">' + escapeHtml(priorLeg ? priorLeg.distanceMiles + " mi" : "Start here") + '</span></div>',
        '        <div class="route-meta-pair"><span class="route-meta-label">Roof</span><span class="route-meta-value">' + escapeHtml(park.roof) + '</span></div>',
        '        <div class="route-meta-pair"><span class="route-meta-label">Visited</span><span class="route-meta-value">' + escapeHtml(visitMeta ? (visitMeta.visitDate || "Marked") : "Not yet") + '</span></div>',
        '      </div>',
        '      <div class="route-actions">',
        '        <button type="button" class="btn btn-success route-visit-btn" data-visit-toggle="' + escapeHtml(park.id) + '">' + (visited ? "Visited" : "Mark visited") + '</button>',
        '        <button type="button" class="btn ' + (onRoute ? 'btn-danger-outline' : 'btn-browse') + ' route-action-btn" data-route-toggle="' + escapeHtml(park.id) + '">' + (onRoute ? "Remove stop" : "Add stop") + '</button>',
        '        <a href="scorekeeper.html" class="btn btn-score route-plan-link" data-score-park="' + escapeHtml(park.id) + '">Scorekeeper</a>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderAnchorBlock(anchor) {
    if (!anchor.date && !anchor.price) return "";

    var lines = [];
    if (anchor.date) {
      lines.push('<div class="anchor-line">' + escapeHtml(anchor.date) + '</div>');
    }
    if (anchor.price) {
      lines.push('<div class="anchor-line">' + escapeHtml(anchor.price) + '</div>');
    }

    return [
      '<div class="anchor-block">',
      '  <div class="anchor-label">Anchor</div>',
      lines.join(""),
      '</div>'
    ].join("");
  }

  function renderSignalBlock(leg, park, anchor, warningText) {
    return [
      '<div class="signal-block">',
      '  <div class="signal-strip">',
      '    <span class="signal-pill">' + escapeHtml(app.minutesToReadable(leg.travelMinutes)) + ' drive</span>',
      '    <span class="signal-pill">' + escapeHtml(park.transitNote) + '</span>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function renderLegs() {
    var activeTrip = app.getActiveTrip();
    var routeParks = getRouteSelection();

    renderMapPanel(routeParks, activeTrip);

    if (!activeTrip.legs.length) {
      logisticsGridEl.innerHTML = [
        renderEmptyState("No stops yet. Start with a park.", ""),
        renderDemoLegCard()
      ].join("");
      return;
    }

    logisticsGridEl.innerHTML = activeTrip.legs.map(function mapLeg(leg, index) {
      var fromPark = app.getParkById(leg.fromParkId);
      var toPark = app.getParkById(leg.toParkId);
      var legNote = app.getLegScratchpad(leg.id);
      var noteText = legNote ? legNote.text : "";
      var anchor = extractAnchor(noteText);
      var warningText = anchor.warning || deriveEventWarning(toPark || {});
      var ticketBadge = getTicketBadge(toPark ? toPark.ticketApproach : "");

      if (!fromPark || !toPark) return "";

      return [
        '<section class="leg-card fade-up fade-up-' + Math.min(index + 2, 5) + '">',
        warningText ? '  <div class="leg-warning">' + escapeHtml(warningText) + '</div>' : '',
        '  <div class="leg-header">',
        '    <div>',
        '      <div class="leg-title">' + escapeHtml(fromPark.name) + ' → ' + escapeHtml(toPark.name) + '</div>',
        '      <div class="leg-subtitle">Leg ' + (index + 1) + ' · ' + escapeHtml(fromPark.city) + ' to ' + escapeHtml(toPark.city) + '</div>',
        '    </div>',
        anchor.date ? '    <div class="leg-date-chip">' + escapeHtml(anchor.date) + '</div>' : '',
        '  </div>',
        renderAnchorBlock(anchor),
        renderSignalBlock(leg, toPark, anchor, warningText),
        '  <div class="ticket-badge ' + ticketBadge.tone + '">' + escapeHtml(ticketBadge.label) + '</div>',
        '  <div class="leg-status-row">',
        app.LEG_STATUSES.map(function mapStatus(status) {
          return '<button type="button" class="leg-status-chip ' + (status === leg.status ? 'active' : '') + '" data-leg-id="' + escapeHtml(leg.id) + '" data-leg-status="' + escapeHtml(status) + '">' + escapeHtml(status) + '</button>';
        }).join(""),
        '  </div>',
        '  <div class="leg-scratch-shell">',
        '    <label class="leg-scratch-label" for="leg-note-' + escapeHtml(leg.id) + '">Working notes</label>',
        '    <textarea class="leg-scratchpad" id="leg-note-' + escapeHtml(leg.id) + '" data-leg-note="' + escapeHtml(leg.id) + '" placeholder="Add dates, prices, seat sections, parking notes, or anything that changes the call.">' + escapeHtml(noteText) + '</textarea>',
        '  </div>',
        '  <div class="leg-actions">',
        '    <a href="scorekeeper.html" class="btn btn-score leg-score-btn" data-score-park="' + escapeHtml(toPark.id) + '">Score a game here</a>',
        '  </div>',
        '</section>'
      ].join("");
    }).join("");
  }

  function renderAll() {
    renderTripSummary();
    renderRouteCards();
    renderLegs();
  }

  document.addEventListener("click", function handleClick(event) {
    var scoreLink = event.target.closest("[data-score-park]");
    if (scoreLink) {
      app.setScorekeeperContext(scoreLink.dataset.scorePark);
      return;
    }

    var visitToggle = event.target.closest("[data-visit-toggle]");
    if (visitToggle) {
      app.toggleVisited(visitToggle.dataset.visitToggle, {});
      renderAll();
      return;
    }

    var routeToggle = event.target.closest("[data-route-toggle]");
    if (routeToggle) {
      var parkId = routeToggle.dataset.routeToggle;
      var onRoute = app.getRouteStore().stops.includes(parkId);
      if (onRoute) app.removeRouteStop(parkId);
      else app.addRouteStop(parkId);
      renderAll();
      return;
    }

    var statusChip = event.target.closest("[data-leg-status]");
    if (statusChip) {
      app.setLegStatus(statusChip.dataset.legId, statusChip.dataset.legStatus);
      renderLegs();
      return;
    }
  });

  tripScratchpadEl.addEventListener("input", function handleTripNote(event) {
    app.saveTripScratchpad(event.target.value);
  });

  logisticsGridEl.addEventListener("input", function handleLegNote(event) {
    if (!event.target.matches("[data-leg-note]")) return;
    app.saveLegScratchpad(event.target.dataset.legNote, event.target.value);
  });

  logisticsGridEl.addEventListener("focusout", function handleLegBlur(event) {
    if (!event.target.matches("[data-leg-note]")) return;
    renderLegs();
  });

  renderAll();
})(window);
