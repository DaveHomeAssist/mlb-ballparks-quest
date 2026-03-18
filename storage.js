(function attachStorageModule(global) {
  "use strict";

  var DEFAULT_DEBOUNCE_MS = 140;

  function cloneValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof global.structuredClone === "function") {
      return global.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function canUseLocalStorage() {
    try {
      var probeKey = "__bpq_storage_probe__";
      global.localStorage.setItem(probeKey, "1");
      global.localStorage.removeItem(probeKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function safeParse(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return null;
    }
  }

  function createStorage(options) {
    var settings = options || {};
    var namespace = settings.namespace || "";
    var debounceMs = Number.isFinite(settings.debounceMs) ? Math.max(0, settings.debounceMs) : DEFAULT_DEBOUNCE_MS;
    var storageEnabled = canUseLocalStorage();
    var pendingWrites = new Map();
    var timers = new Map();

    function namespacedKey(key) {
      return namespace ? namespace + ":" + String(key) : String(key);
    }

    function clearTimer(key) {
      if (!timers.has(key)) return;
      global.clearTimeout(timers.get(key));
      timers.delete(key);
    }

    function writeNow(fullKey, value) {
      if (!storageEnabled) return cloneValue(value);

      if (value === undefined) {
        global.localStorage.removeItem(fullKey);
        return undefined;
      }

      global.localStorage.setItem(fullKey, JSON.stringify(value));
      return cloneValue(value);
    }

    function flushKey(fullKey) {
      clearTimer(fullKey);
      if (!pendingWrites.has(fullKey)) return null;

      var value = pendingWrites.get(fullKey);
      pendingWrites.delete(fullKey);
      return writeNow(fullKey, value);
    }

    function scheduleWrite(fullKey, value) {
      pendingWrites.set(fullKey, cloneValue(value));
      clearTimer(fullKey);

      if (debounceMs === 0) {
        return flushKey(fullKey);
      }

      timers.set(fullKey, global.setTimeout(function onDebouncedWrite() {
        flushKey(fullKey);
      }, debounceMs));

      return cloneValue(value);
    }

    function get(key) {
      var fullKey = namespacedKey(key);

      if (pendingWrites.has(fullKey)) {
        return cloneValue(pendingWrites.get(fullKey));
      }

      if (!storageEnabled) return null;
      return safeParse(global.localStorage.getItem(fullKey));
    }

    function set(key, value) {
      return scheduleWrite(namespacedKey(key), value);
    }

    function update(key, updater) {
      if (typeof updater !== "function") {
        throw new TypeError("update(key, fn) requires a function");
      }

      var currentValue = get(key);
      var nextValue = updater(cloneValue(currentValue));
      set(key, nextValue);
      return cloneValue(nextValue);
    }

    function flush(key) {
      if (key !== undefined) {
        return flushKey(namespacedKey(key));
      }

      pendingWrites.forEach(function eachPending(_, fullKey) {
        flushKey(fullKey);
      });

      return true;
    }

    function hasPendingWrite(key) {
      if (key !== undefined) {
        return pendingWrites.has(namespacedKey(key));
      }
      return pendingWrites.size > 0;
    }

    return {
      get: get,
      set: set,
      update: update,
      flush: flush,
      hasPendingWrite: hasPendingWrite,
      namespace: namespace,
      debounceMs: debounceMs
    };
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.createStorage = createStorage;
  global.BPQ.storage = createStorage({
    namespace: "bpq.prototype",
    debounceMs: DEFAULT_DEBOUNCE_MS
  });
})(window);
