(function attachQuestPlatformScheduleCore(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function getUtils() {
    var root = ensureRoot();
    if (!root.utils) {
      throw new Error("schedule-core requires shared utils");
    }
    return root.utils;
  }

  function normalizeEvent(rawEvent, productConfig) {
    var utils = getUtils();
    var event = rawEvent || {};
    var range = utils.parseDateRange(event.dateRange || event.window || event);
    var entityId = event.entityId || event.parkId || event.festivalId || event.id || null;

    return {
      id: event.id || [productConfig && productConfig.productId, entityId, range.start && range.start.toISOString()].filter(Boolean).join(":"),
      entityId: entityId,
      title: event.title || event.name || "",
      kind: event.kind || event.type || "event",
      start: range.start,
      end: range.end || range.start,
      location: event.location || "",
      notes: event.notes || "",
      metadata: event.metadata || {}
    };
  }

  function normalizeSchedule(events, productConfig) {
    return (events || [])
      .map(function mapEvent(event) {
        return normalizeEvent(event, productConfig);
      })
      .filter(function filterEvent(event) {
        return Boolean(event.entityId && event.start);
      })
      .sort(function sortEvent(a, b) {
        return a.start - b.start;
      });
  }

  function groupByEntity(events) {
    return (events || []).reduce(function reduceEvents(acc, event) {
      (acc[event.entityId] ||= []).push(event);
      return acc;
    }, {});
  }

  function overlapsWindow(event, windowStart, windowEnd) {
    if (!event || !event.start) return false;
    var eventEnd = event.end || event.start;
    return event.start <= windowEnd && eventEnd >= windowStart;
  }

  function filterUpcoming(events, options) {
    var settings = options || {};
    var now = settings.now || new Date();
    var daysAhead = Number.isFinite(settings.daysAhead) ? settings.daysAhead : 30;
    var end = new Date(now.getTime());
    end.setDate(end.getDate() + daysAhead);

    return (events || []).filter(function filterEvent(event) {
      return overlapsWindow(event, now, end);
    });
  }

  function nextN(events, count) {
    var limit = Number.isFinite(count) ? Math.max(0, count) : 5;
    return (events || []).slice(0, limit);
  }

  function toCalendarPayload(event) {
    if (!event) return null;
    return {
      title: event.title,
      start: event.start ? event.start.toISOString() : null,
      end: event.end ? event.end.toISOString() : null,
      location: event.location || "",
      description: event.notes || ""
    };
  }

  var root = ensureRoot();
  root.scheduleCore = {
    normalizeEvent: normalizeEvent,
    normalizeSchedule: normalizeSchedule,
    groupByEntity: groupByEntity,
    overlapsWindow: overlapsWindow,
    filterUpcoming: filterUpcoming,
    nextN: nextN,
    toCalendarPayload: toCalendarPayload
  };
})(window);
