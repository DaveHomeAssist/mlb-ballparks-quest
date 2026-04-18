(function attachQuestPlatformContextStore(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function createContextStore(storage, productId, key) {
    if (!storage) {
      throw new Error("createContextStore requires storage");
    }

    var storageKey = key || "context";

    function read(fallback) {
      return storage.readScoped(productId, storageKey, fallback || {});
    }

    function write(value) {
      return storage.writeScoped(productId, storageKey, value || {});
    }

    function patch(updater) {
      return storage.update(storage.getKey(productId, storageKey), function updateContext(currentValue) {
        var current = currentValue || {};
        if (typeof updater === "function") {
          return updater(current) || current;
        }
        return Object.assign({}, current, updater || {});
      }, {});
    }

    function clear() {
      return storage.removeScoped(productId, storageKey);
    }

    return {
      read: read,
      write: write,
      patch: patch,
      clear: clear
    };
  }

  var root = ensureRoot();
  root.contextStore = {
    createContextStore: createContextStore
  };
})(window);
