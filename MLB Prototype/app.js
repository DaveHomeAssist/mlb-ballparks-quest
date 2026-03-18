(function attachPrototypeApp(global) {
  "use strict";

  var namespace = global.BPQ = global.BPQ || {};
  var storage = namespace.storage;
  var data = namespace.data;
  var utils = namespace.utils;

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

    return cloneValue(nextVisit);
  }

  function unmarkVisited(parkId) {
    storage.update(data.KEYS.visits, function removeVisits(currentVisits) {
      return (Array.isArray(currentVisits) ? currentVisits : []).filter(function keep(visit) {
        return visit.parkId !== parkId;
      });
    });
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
    var nextLegs = [];

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

  function saveActiveTrip(nextTrip) {
    var sanitizedTrip = sanitizeActiveTrip(nextTrip);
    sanitizedTrip.updatedAt = nowIso();
    storage.set(data.KEYS.activeTrip, sanitizedTrip);
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
    return cloneValue(nextTrip || getActiveTrip());
  }

  function getRouteStore() {
    var trip = getActiveTrip();
    return {
      version: 1,
      stops: cloneValue(trip.parkIds)
    };
  }

  function saveRouteStore(store) {
    return updateActiveTrip(function applyRoute(currentTrip) {
      currentTrip.parkIds = Array.isArray(store && store.stops) ? store.stops.slice() : [];
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

  function addRouteStop(parkId) {
    return updateActiveTrip(function addStop(currentTrip) {
      if (!currentTrip.parkIds.includes(parkId)) {
        currentTrip.parkIds.push(parkId);
      }
      return currentTrip;
    }).parkIds.slice();
  }

  function removeRouteStop(parkId) {
    return updateActiveTrip(function removeStop(currentTrip) {
      currentTrip.parkIds = currentTrip.parkIds.filter(function keep(id) {
        return id !== parkId;
      });
      return currentTrip;
    }).parkIds.slice();
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

  function setScorekeeperContext(parkId) {
    var activeTrip = getActiveTrip();
    var targetParkId = parkId || activeTrip.parkIds[0] || null;
    var park = targetParkId ? getParkById(targetParkId) : null;
    if (!park) return null;

    var payload = {
      version: 2,
      parkId: park.id,
      venue: park.name,
      homeTeam: park.team,
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
    return setScorekeeperContext(activeTrip.parkIds[0]);
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
    getRouteParks: getRouteParks,
    addRouteStop: addRouteStop,
    removeRouteStop: removeRouteStop,
    getLegById: getLegById,
    setLegStatus: setLegStatus,
    getNextTargets: getNextTargets,
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
    distanceMiles: utils.distanceMiles,
    formatDate: utils.formatDate,
    minutesToReadable: utils.minutesToReadable
  };
})(window);
