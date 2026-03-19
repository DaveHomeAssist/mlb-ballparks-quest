(function attachPrototypeApp(global) {
  "use strict";

  var namespace = global.BPQ = global.BPQ || {};
  var storage = namespace.storage;
  var data = namespace.data;
  var utils = namespace.utils;
  var schedule = namespace.schedule;

  if (!storage || !data || !utils) {
    throw new Error("Ballparks Quest infrastructure modules must load before app.js");
  }

  var LEG_STATUSES = ["idea", "active", "booked", "completed"];
  var SCOREKEEPER_CONTEXT_KEY = "scorekeeperContext";

  function cloneValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof global.structuredClone === "function") {
      return global.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function createId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefix + "-" + global.crypto.randomUUID();
    }
    return prefix + "-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function getParks() {
    return data.getParks();
  }

  function getParkById(parkId) {
    return getParks().find(function findPark(park) {
      return park.id === parkId;
    }) || null;
  }

  function getVisits() {
    return data.getVisits();
  }

  function saveVisits(nextVisits) {
    storage.set(data.KEYS.visits, nextVisits);
    return cloneValue(nextVisits);
  }

  function getVisitedMeta(parkId) {
    return getVisits()
      .filter(function byPark(visit) {
        return visit.parkId === parkId;
      })
      .sort(function byUpdatedAt(a, b) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })[0] || null;
  }

  function isVisited(parkId) {
    return Boolean(getVisitedMeta(parkId));
  }

  function markVisited(parkId, patch) {
    var park = getParkById(parkId);
    if (!park) return null;

    var patchValue = patch || {};
    var timestamp = nowIso();
    var visitDate = patchValue.visitDate || timestamp.slice(0, 10);
    var nextVisit = null;

    storage.update(data.KEYS.visits, function updateVisits(currentVisits) {
      var visits = Array.isArray(currentVisits) ? cloneValue(currentVisits) : [];
      var existingIndex = visits.findIndex(function match(visit) {
        return visit.parkId === parkId;
      });

      nextVisit = {
        id: existingIndex >= 0 ? visits[existingIndex].id : createId("visit"),
        parkId: parkId,
        visitDate: visitDate,
        rating: patchValue.rating != null ? patchValue.rating : (existingIndex >= 0 ? visits[existingIndex].rating : null),
        bestFeature: patchValue.bestFeature || (existingIndex >= 0 ? visits[existingIndex].bestFeature : "") || "Ballpark memory",
        notes: patchValue.notes || (existingIndex >= 0 ? visits[existingIndex].notes : "") || "",
        createdAt: existingIndex >= 0 ? visits[existingIndex].createdAt : timestamp,
        updatedAt: timestamp
      };

      if (existingIndex >= 0) {
        visits[existingIndex] = nextVisit;
      } else {
        visits.push(nextVisit);
      }

      return visits;
    });
    storage.flush(data.KEYS.visits);

    return cloneValue(nextVisit);
  }

  function unmarkVisited(parkId) {
    storage.update(data.KEYS.visits, function removeVisits(currentVisits) {
      return (Array.isArray(currentVisits) ? currentVisits : []).filter(function keep(visit) {
        return visit.parkId !== parkId;
      });
    });
    storage.flush(data.KEYS.visits);
  }

  function toggleVisited(parkId, patch) {
    if (isVisited(parkId)) {
      unmarkVisited(parkId);
      return false;
    }

    markVisited(parkId, patch);
    return true;
  }

  function getVisitedParks() {
    return getVisits()
      .map(function toPair(visit) {
        var park = getParkById(visit.parkId);
        return park ? { park: park, meta: visit } : null;
      })
      .filter(Boolean)
      .sort(function byVisitDate(a, b) {
        return new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime();
      });
  }

  function priorityScore(park) {
    var tierWeight = { S: 420, A: 280, B: 150, C: 40 }[park.tier] || 0;
    var ageWeight = Math.max(0, 2026 - Number(park.opened || 2026)) * 1.4;
    var eventWeight = Array.isArray(park.specialEvents) ? park.specialEvents.length * 10 : 0;
    var roofWeight = park.roof === "Retractable" ? 8 : 0;
    return tierWeight + ageWeight + eventWeight + roofWeight + (isVisited(park.id) ? -1000 : 0);
  }

  function deriveLegId(fromParkId, toParkId) {
    return "leg-" + fromParkId + "-to-" + toParkId;
  }

  function buildLeg(fromParkId, toParkId, existingLeg) {
    var fromPark = getParkById(fromParkId);
    var toPark = getParkById(toParkId);
    if (!fromPark || !toPark) return null;

    var distance = utils.distanceMiles(
      fromPark.coordinates.lat,
      fromPark.coordinates.lng,
      toPark.coordinates.lat,
      toPark.coordinates.lng
    );

    var estimatedMinutes = Math.max(25, Math.round((distance / 58) * 60));
    var timestamp = nowIso();

    return {
      id: existingLeg && existingLeg.id ? existingLeg.id : deriveLegId(fromParkId, toParkId),
      fromParkId: fromParkId,
      toParkId: toParkId,
      status: LEG_STATUSES.includes(existingLeg && existingLeg.status) ? existingLeg.status : "idea",
      distanceMiles: distance,
      travelMinutes: existingLeg && Number.isFinite(existingLeg.travelMinutes) ? existingLeg.travelMinutes : estimatedMinutes,
      createdAt: existingLeg && existingLeg.createdAt ? existingLeg.createdAt : timestamp,
      updatedAt: existingLeg && existingLeg.updatedAt ? existingLeg.updatedAt : timestamp
    };
  }

  function sanitizeActiveTrip(tripValue) {
    var source = tripValue && typeof tripValue === "object" ? cloneValue(tripValue) : cloneValue(data.getActiveTrip());
    var validParkIds = Array.isArray(source.parkIds)
      ? source.parkIds.filter(function keep(parkId, index, list) {
          return getParkById(parkId) && list.indexOf(parkId) === index;
        })
      : [];

    var existingLegs = Array.isArray(source.legs) ? source.legs : [];
    var nextGameSelections = {};
    var nextLegs = [];

    if (source.gameSelections && typeof source.gameSelections === "object") {
      validParkIds.forEach(function mapSelection(parkId) {
        var gameId = source.gameSelections[parkId];
        if (typeof gameId !== "string" || !gameId) return;
        var game = getGameById(gameId);
        if (game && game.parkId === parkId) nextGameSelections[parkId] = gameId;
      });
    }

    for (var index = 0; index < validParkIds.length - 1; index += 1) {
      var fromParkId = validParkIds[index];
      var toParkId = validParkIds[index + 1];
      var existingLeg = existingLegs.find(function match(leg) {
        return leg.fromParkId === fromParkId && leg.toParkId === toParkId;
      });
      var nextLeg = buildLeg(fromParkId, toParkId, existingLeg);
      if (nextLeg) nextLegs.push(nextLeg);
    }

    return {
      id: source.id || createId("trip"),
      title: source.title || "Next Ballpark Run",
      parkIds: validParkIds,
      gameSelections: nextGameSelections,
      legs: nextLegs,
      startDate: source.startDate || null,
      endDate: source.endDate || null,
      notes: source.notes || "",
      updatedAt: source.updatedAt || nowIso()
    };
  }

  function getActiveTrip() {
    return sanitizeActiveTrip(storage.get(data.KEYS.activeTrip));
  }

  function normalizeTripDate(value) {
    if (value == null) return null;
    var text = String(value).trim();
    if (!text) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
  }

  function saveActiveTrip(nextTrip) {
    var sanitizedTrip = sanitizeActiveTrip(nextTrip);
    sanitizedTrip.updatedAt = nowIso();
    storage.set(data.KEYS.activeTrip, sanitizedTrip);
    storage.flush(data.KEYS.activeTrip);
    return cloneValue(sanitizedTrip);
  }

  function updateActiveTrip(updater) {
    var nextTrip = null;
    storage.update(data.KEYS.activeTrip, function updateTrip(currentTrip) {
      var baseTrip = sanitizeActiveTrip(currentTrip);
      nextTrip = sanitizeActiveTrip(updater(cloneValue(baseTrip)) || baseTrip);
      nextTrip.updatedAt = nowIso();
      return nextTrip;
    });
    storage.flush(data.KEYS.activeTrip);
    return cloneValue(nextTrip || getActiveTrip());
  }

  function getRouteStore() {
    var trip = getActiveTrip();
    return {
      version: 1,
      stops: trip.parkIds.map(function mapStop(parkId) {
        return {
          parkId: parkId,
          gameId: trip.gameSelections[parkId] || null
        };
      })
    };
  }

  function saveRouteStore(store) {
    return updateActiveTrip(function applyRoute(currentTrip) {
      var nextStops = Array.isArray(store && store.stops) ? store.stops.slice() : [];
      currentTrip.parkIds = nextStops.map(function mapStop(stop) {
        return typeof stop === "string" ? stop : stop && stop.parkId;
      }).filter(Boolean);
      currentTrip.gameSelections = {};
      nextStops.forEach(function assignSelection(stop) {
        if (!stop || typeof stop === "string" || !stop.parkId || !stop.gameId) return;
        currentTrip.gameSelections[stop.parkId] = stop.gameId;
      });
      return currentTrip;
    });
  }

  function setTripWindow(startDate, endDate) {
    return updateActiveTrip(function applyWindow(currentTrip) {
      currentTrip.startDate = normalizeTripDate(startDate);
      currentTrip.endDate = normalizeTripDate(endDate);

      if (currentTrip.startDate && currentTrip.endDate && currentTrip.startDate > currentTrip.endDate) {
        var swap = currentTrip.startDate;
        currentTrip.startDate = currentTrip.endDate;
        currentTrip.endDate = swap;
      }

      return currentTrip;
    });
  }

  function getRouteParks() {
    return getActiveTrip().parkIds
      .map(function toPark(parkId) {
        return getParkById(parkId);
      })
      .filter(Boolean);
  }

  function getRouteStops() {
    var trip = getActiveTrip();
    return trip.parkIds.map(function mapStop(parkId) {
      var park = getParkById(parkId);
      var gameId = trip.gameSelections[parkId] || null;
      var game = gameId ? getGameById(gameId) : null;
      return park ? { park: park, parkId: parkId, gameId: game ? game.gameId : null, game: game } : null;
    }).filter(Boolean);
  }

  function addRouteStop(parkId, gameId) {
    return updateActiveTrip(function addStop(currentTrip) {
      if (!currentTrip.parkIds.includes(parkId)) {
        currentTrip.parkIds.push(parkId);
      }
      currentTrip.gameSelections = currentTrip.gameSelections || {};
      if (gameId && getGameById(gameId)) currentTrip.gameSelections[parkId] = gameId;
      return currentTrip;
    }).parkIds.slice();
  }

  function removeRouteStop(parkId) {
    return updateActiveTrip(function removeStop(currentTrip) {
      currentTrip.parkIds = currentTrip.parkIds.filter(function keep(id) {
        return id !== parkId;
      });
      currentTrip.gameSelections = currentTrip.gameSelections || {};
      delete currentTrip.gameSelections[parkId];
      return currentTrip;
    }).parkIds.slice();
  }

  function setRouteStopGame(parkId, gameId) {
    return updateActiveTrip(function updateStopGame(currentTrip) {
      currentTrip.gameSelections = currentTrip.gameSelections || {};
      if (!currentTrip.parkIds.includes(parkId)) currentTrip.parkIds.push(parkId);
      if (gameId && getGameById(gameId)) currentTrip.gameSelections[parkId] = gameId;
      else delete currentTrip.gameSelections[parkId];
      return currentTrip;
    });
  }

  function setLegStatus(legId, status) {
    if (!LEG_STATUSES.includes(status)) {
      throw new TypeError("Leg status must be idea, active, booked, or completed");
    }

    return updateActiveTrip(function updateLeg(currentTrip) {
      currentTrip.legs = currentTrip.legs.map(function mapLeg(leg) {
        if (leg.id !== legId) return leg;
        leg.status = status;
        leg.updatedAt = nowIso();
        return leg;
      });
      return currentTrip;
    });
  }

  function getLegById(legId) {
    return getActiveTrip().legs.find(function match(leg) {
      return leg.id === legId;
    }) || null;
  }

  function getNextTargets(count) {
    var limit = Number.isFinite(count) ? Math.max(1, count) : 3;
    var activeTripIds = getActiveTrip().parkIds;

    return getParks()
      .filter(function keep(park) {
        return !isVisited(park.id) && !activeTripIds.includes(park.id);
      })
      .sort(function sortByPriority(a, b) {
        return priorityScore(b) - priorityScore(a);
      })
      .slice(0, limit);
  }

  function getGameById(gameId) {
    var game = schedule && schedule.getGameById ? schedule.getGameById(gameId) : null;
    if (!game) return null;
    var park = getParkById(game.parkId);
    game.startDateTimeLocal = game.startDateTimeLocal || buildLocalStartDateTime(game);
    game.venue = game.venue || (park ? park.name : "");
    return game;
  }

  function buildLocalStartDateTime(game) {
    if (!game || !game.d || !game.t || /tbd/i.test(game.t)) return "";
    var match = String(game.t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return "";
    var hours = Number(match[1]) % 12;
    var minutes = Number(match[2]);
    if (/pm/i.test(match[3])) hours += 12;
    var hh = String(hours).padStart(2, "0");
    var mm = String(minutes).padStart(2, "0");
    return game.d + "T" + hh + ":" + mm + ":00";
  }

  function getGamesByPark(parkId) {
    var park = getParkById(parkId);
    if (!park || !schedule || !schedule.getGamesForPark || !schedule.decorateGame) return [];
    return schedule.getGamesForPark(parkId).map(function mapGame(game) {
      var decorated = schedule.decorateGame(parkId, park.team, game);
      decorated.startDateTimeLocal = buildLocalStartDateTime(game);
      decorated.venue = park.name;
      return decorated;
    });
  }

  function getUpcomingGamesByPark(parkId, limit) {
    var park = getParkById(parkId);
    if (!park || !schedule || !schedule.getUpcomingGames || !schedule.decorateGame) return [];
    return schedule.getUpcomingGames(parkId, limit || 3).map(function mapGame(game) {
      var decorated = schedule.decorateGame(parkId, park.team, game);
      decorated.startDateTimeLocal = buildLocalStartDateTime(game);
      decorated.venue = park.name;
      return decorated;
    });
  }

  function buildMapsUrl(destination, origin, travelMode) {
    var mode = travelMode || "driving";
    var params = new URLSearchParams({ api: "1", destination: destination, travelmode: mode });
    if (origin) params.set("origin", origin);
    return "https://www.google.com/maps/dir/?" + params.toString();
  }

  function buildGameICS(game) {
    if (!game) return "";

    function toIcsDate(date) {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    }

    var startRaw = game.startDateTimeLocal || (game.d ? game.d + "T19:05:00" : "");
    var startDate = new Date(startRaw);
    if (!Number.isFinite(startDate.getTime())) startDate = new Date(game.d + "T19:05:00");
    var endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000));
    var park = getParkById(game.parkId);
    var location = game.venue || (park ? park.name : "");
    var summary = (game.awayTeam || "Away") + " at " + (game.homeTeam || "Home");
    var uid = "bpq-" + (game.gameId || createId("game")) + "@ballparksquest.local";

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ballparks Quest//EN",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + toIcsDate(new Date()),
      "DTSTART:" + toIcsDate(startDate),
      "DTEND:" + toIcsDate(endDate),
      "SUMMARY:" + summary,
      "LOCATION:" + location,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function downloadICS(filename, content) {
    var blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = global.document.createElement("a");
    link.href = url;
    link.download = filename;
    global.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadGameICS(game) {
    if (!game) return;
    var filename = ((game.gameId || "ballparks-quest-game") + ".ics").replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    downloadICS(filename, buildGameICS(game));
  }

  function getNotes(scope, scopeId) {
    return data.getNotes(scope, scopeId);
  }

  function saveNote(scope, scopeId, text) {
    return data.saveNote(scope, scopeId, text);
  }

  function getTripScratchpad() {
    var trip = getActiveTrip();
    return getNotes("trip", trip.id)[0] || null;
  }

  function saveTripScratchpad(text) {
    return saveNote("trip", getActiveTrip().id, text);
  }

  function getLegScratchpad(legId) {
    return getNotes("leg", legId)[0] || null;
  }

  function saveLegScratchpad(legId, text) {
    return saveNote("leg", legId, text);
  }

  function getParkScratchpad(parkId) {
    return getNotes("park", parkId)[0] || null;
  }

  function saveParkScratchpad(parkId, text) {
    return saveNote("park", parkId, text);
  }

  function setScorekeeperContext(input) {
    var activeTrip = getActiveTrip();
    var targetGameId = input && typeof input === "object" ? input.gameId : null;
    var targetParkId = input && typeof input === "object"
      ? input.parkId
      : (typeof input === "string" ? input : null);
    if (!targetParkId && targetGameId) {
      var selectedGame = getGameById(targetGameId);
      targetParkId = selectedGame ? selectedGame.parkId : null;
    }
    targetParkId = targetParkId || activeTrip.parkIds[0] || null;
    var park = targetParkId ? getParkById(targetParkId) : null;
    var game = targetGameId ? getGameById(targetGameId) : null;
    if (!park) return null;

    var payload = {
      version: 3,
      parkId: park.id,
      venue: park.name,
      homeTeam: park.team,
      awayTeam: game ? game.awayTeam : "",
      gameId: game ? game.gameId : "",
      startDateTimeLocal: game ? (game.startDateTimeLocal || "") : "",
      gameLabel: game && schedule && schedule.formatGameLine ? schedule.formatGameLine(game) : "",
      city: park.city,
      color: park.color,
      tripId: activeTrip.id,
      routeParkIds: activeTrip.parkIds.slice(),
      openedAt: nowIso()
    };

    storage.set(SCOREKEEPER_CONTEXT_KEY, payload);
    storage.flush(SCOREKEEPER_CONTEXT_KEY);
    return cloneValue(payload);
  }

  function getScorekeeperContext() {
    var explicitContext = storage.get(SCOREKEEPER_CONTEXT_KEY);
    if (explicitContext && explicitContext.parkId && getParkById(explicitContext.parkId)) {
      return cloneValue(explicitContext);
    }

    var activeTrip = getActiveTrip();
    if (!activeTrip.parkIds.length) return null;
    return setScorekeeperContext({
      parkId: activeTrip.parkIds[0],
      gameId: activeTrip.gameSelections[activeTrip.parkIds[0]] || ""
    });
  }

  function clearScorekeeperContext() {
    storage.set(SCOREKEEPER_CONTEXT_KEY, undefined);
    storage.flush(SCOREKEEPER_CONTEXT_KEY);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in global.navigator)) return;

    global.addEventListener("load", function onLoad() {
      global.navigator.serviceWorker.register("sw.js").catch(function onError(error) {
        console.warn("SW registration failed:", error);
      });
    });
  }

  data.initializeData();
  registerServiceWorker();

  namespace.app = {
    LEG_STATUSES: LEG_STATUSES.slice(),
    getParks: getParks,
    getParkById: getParkById,
    getVisits: getVisits,
    getVisitedMeta: getVisitedMeta,
    getVisitedParks: getVisitedParks,
    isVisited: isVisited,
    markVisited: markVisited,
    unmarkVisited: unmarkVisited,
    toggleVisited: toggleVisited,
    priorityScore: priorityScore,
    getActiveTrip: getActiveTrip,
    saveActiveTrip: saveActiveTrip,
    updateActiveTrip: updateActiveTrip,
    getRouteStore: getRouteStore,
    saveRouteStore: saveRouteStore,
    setTripWindow: setTripWindow,
    getRouteParks: getRouteParks,
    getRouteStops: getRouteStops,
    addRouteStop: addRouteStop,
    removeRouteStop: removeRouteStop,
    setRouteStopGame: setRouteStopGame,
    getLegById: getLegById,
    setLegStatus: setLegStatus,
    getNextTargets: getNextTargets,
    getGameById: getGameById,
    getGamesByPark: getGamesByPark,
    getUpcomingGamesByPark: getUpcomingGamesByPark,
    getNotes: getNotes,
    saveNote: saveNote,
    getTripScratchpad: getTripScratchpad,
    saveTripScratchpad: saveTripScratchpad,
    getLegScratchpad: getLegScratchpad,
    saveLegScratchpad: saveLegScratchpad,
    getParkScratchpad: getParkScratchpad,
    saveParkScratchpad: saveParkScratchpad,
    setScorekeeperContext: setScorekeeperContext,
    getScorekeeperContext: getScorekeeperContext,
    clearScorekeeperContext: clearScorekeeperContext,
    buildMapsUrl: buildMapsUrl,
    buildGameICS: buildGameICS,
    downloadICS: downloadICS,
    downloadGameICS: downloadGameICS,
    distanceMiles: utils.distanceMiles,
    formatDate: utils.formatDate,
    minutesToReadable: utils.minutesToReadable
  };
})(window);
