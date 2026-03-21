/* config.js — MLB Ballparks Quest
   Registers product config against quest-platform shared config core. */
(function attachMlbConfigModule(global) {
  "use strict";

  var QP = global.__QUEST_PLATFORM__;
  if (!QP || !QP.config) {
    throw new Error("Load quest-platform/shared/js/core/config.js before mlb config.js");
  }

  var config = QP.config.createProductConfig({
    productId: "mlb",
    productCode: "BPQ",
    appName: "MLB Ballparks Quest",
    namespace: "BPQ",
    storage: {
      version: 1,
      keys: {
        visits: "visits",
        routeLegs: "routeLegs",
        activeTrip: "activeTrip",
        planningNotes: "planningNotes",
        entityScratchpads: "entityScratchpads",
        theme: "theme",
        context: "context",
        scorekeeperState: "scorekeeperState",
        scorekeeperExports: "scorekeeperExports",
        priorityTargets: "priorityTargets"
      }
    },
    entities: {
      labelSingular: "park",
      labelPlural: "parks",
      categoryField: "team",
      venueField: "roof"
    },
    schedule: {
      eventLabel: "games",
      daysAheadDefault: 21
    },
    route: {
      stopLabel: "parks",
      routeLabel: "road trip"
    },
    theme: {
      defaultTheme: "ballpark-classic"
    },
    features: {
      scorekeeper: true,
      shortlist: false,
      logisticsLinks: false,
      scheduleImport: true
    },
    ui: {
      homePage: "home",
      explorerPage: "parks",
      routePage: "route",
      journalPage: "scorekeeper"
    }
  });

  global.BPQ = global.BPQ || {};
  global.BPQ.config = QP.config.registerProduct("mlb", config);
})(window);
