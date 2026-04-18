(function attachQuestPlatformVisits(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function createVisitsStore(storage, productId, key) {
    if (!storage) {
      throw new Error("createVisitsStore requires storage");
    }

    var storageKey = key || "visits";

    function readAll() {
      return storage.readScoped(productId, storageKey, {});
    }

    function writeAll(nextValue) {
      return storage.writeScoped(productId, storageKey, nextValue || {});
    }

    function markVisited(entityId, metadata) {
      var now = new Date().toISOString();
      return storage.update(storage.getKey(productId, storageKey), function updateVisits(currentValue) {
        var current = currentValue || {};
        current[entityId] = Object.assign({}, current[entityId], metadata || {}, {
          visited: true,
          visitedAt: (metadata && metadata.visitedAt) || now
        });
        return current;
      }, {});
    }

    function unmarkVisited(entityId) {
      return storage.update(storage.getKey(productId, storageKey), function updateVisits(currentValue) {
        var current = Object.assign({}, currentValue || {});
        delete current[entityId];
        return current;
      }, {});
    }

    function hasVisited(entityId) {
      return Boolean(readAll()[entityId]);
    }

    function countVisited() {
      return Object.keys(readAll()).length;
    }

    return {
      readAll: readAll,
      writeAll: writeAll,
      markVisited: markVisited,
      unmarkVisited: unmarkVisited,
      hasVisited: hasVisited,
      countVisited: countVisited
    };
  }

  var root = ensureRoot();
  root.visits = {
    createVisitsStore: createVisitsStore
  };
})(window);
