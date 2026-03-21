/* storage.js — MLB Ballparks Quest
   Shim that delegates to quest-platform shared storage.
   Preserves BPQ.storage and BPQ.createStorage API exactly.         */
(function attachStorageModule(global) {
  "use strict";

  var QP = global.__QUEST_PLATFORM__;
  if (!QP || !QP.storage) {
    throw new Error("Load quest-platform/shared/js/core/storage.js before mlb storage.js");
  }

  var sharedCreateStorage = QP.storage.createStorage;

  /* Wrap shared createStorage to alias read→get and write→set
     so existing BPQ call sites (storage.get, storage.set) keep working. */
  function createStorage(options) {
    var instance = sharedCreateStorage(options);

    return {
      get: instance.read,
      set: instance.write,
      update: instance.update,
      flush: instance.flush,
      hasPendingWrite: instance.hasPendingWrite,
      remove: instance.remove,
      namespace: instance.namespace,
      debounceMs: instance.debounceMs,
      /* Expose shared-only methods for future migration */
      read: instance.read,
      write: instance.write,
      getKey: instance.getKey,
      readScoped: instance.readScoped,
      writeScoped: instance.writeScoped,
      removeScoped: instance.removeScoped,
      migrateScoped: instance.migrateScoped
    };
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.createStorage = createStorage;
  global.BPQ.storage = createStorage({
    namespace: "bpq.prototype",
    debounceMs: QP.storage.DEFAULT_DEBOUNCE_MS
  });
})(window);
