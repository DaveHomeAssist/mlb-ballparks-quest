(function attachQuestPlatformNotes(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function createNotesStore(storage, productId, key) {
    if (!storage) {
      throw new Error("createNotesStore requires storage");
    }

    var storageKey = key || "entityScratchpads";

    function readAll() {
      return storage.readScoped(productId, storageKey, {});
    }

    function read(entityId, fallback) {
      var allNotes = readAll();
      return allNotes[entityId] != null ? allNotes[entityId] : (fallback || "");
    }

    function write(entityId, value) {
      return storage.update(storage.getKey(productId, storageKey), function updateNotes(currentValue) {
        var current = currentValue || {};
        current[entityId] = String(value || "");
        return current;
      }, {});
    }

    function remove(entityId) {
      return storage.update(storage.getKey(productId, storageKey), function updateNotes(currentValue) {
        var current = Object.assign({}, currentValue || {});
        delete current[entityId];
        return current;
      }, {});
    }

    return {
      readAll: readAll,
      read: read,
      write: write,
      remove: remove
    };
  }

  var root = ensureRoot();
  root.notes = {
    createNotesStore: createNotesStore
  };
})(window);
