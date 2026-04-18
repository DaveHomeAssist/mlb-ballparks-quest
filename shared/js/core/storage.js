(function attachQuestPlatformStorage(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";
  var DEFAULT_DEBOUNCE_MS = 140;
  var DEFAULT_VERSION = 1;

  function ensureRoot() {
    global[ROOT_KEY] = global[ROOT_KEY] || {};
    return global[ROOT_KEY];
  }

  function cloneValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof global.structuredClone === "function") {
      return global.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
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

  function canUseLocalStorage() {
    try {
      var probeKey = "__quest_platform_probe__";
      global.localStorage.setItem(probeKey, "1");
      global.localStorage.removeItem(probeKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function createStorage(options) {
    var settings = options || {};
    var namespace = String(settings.namespace || "").trim();
    var version = Number.isFinite(settings.version) ? settings.version : DEFAULT_VERSION;
    var debounceMs = Number.isFinite(settings.debounceMs) ? Math.max(0, settings.debounceMs) : DEFAULT_DEBOUNCE_MS;
    var storageEnabled = canUseLocalStorage();
    var pendingWrites = new Map();
    var timers = new Map();

    function buildKey(key) {
      var baseKey = String(key);
      if (!namespace) return baseKey;
      return namespace + ":" + baseKey;
    }

    function clearTimer(fullKey) {
      if (!timers.has(fullKey)) return;
      global.clearTimeout(timers.get(fullKey));
      timers.delete(fullKey);
    }

    function writeNow(fullKey, value) {
      if (!storageEnabled) return cloneValue(value);

      if (value === undefined) {
        try {
          global.localStorage.removeItem(fullKey);
        } catch (err) {
          emitStorageError(fullKey, err);
        }
        return undefined;
      }

      try {
        global.localStorage.setItem(fullKey, JSON.stringify(value));
      } catch (err) {
        emitStorageError(fullKey, err);
      }
      return cloneValue(value);
    }

    function emitStorageError(fullKey, err) {
      try {
        if (global.dispatchEvent && typeof CustomEvent === "function") {
          global.dispatchEvent(new CustomEvent("quest:storage-error", {
            detail: { key: fullKey, err: String(err && err.message || err) }
          }));
        }
      } catch {}
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

    function read(key, fallback) {
      var fullKey = buildKey(key);

      if (pendingWrites.has(fullKey)) {
        return cloneValue(pendingWrites.get(fullKey));
      }

      if (!storageEnabled) return cloneValue(fallback);

      var parsed = safeParse(global.localStorage.getItem(fullKey));
      return parsed === null ? cloneValue(fallback) : parsed;
    }

    function write(key, value) {
      return scheduleWrite(buildKey(key), value);
    }

    function remove(key) {
      var fullKey = buildKey(key);
      pendingWrites.delete(fullKey);
      clearTimer(fullKey);
      if (storageEnabled) {
        global.localStorage.removeItem(fullKey);
      }
      return true;
    }

    function update(key, updater, fallback) {
      if (typeof updater !== "function") {
        throw new TypeError("update(key, updater) requires a function");
      }

      var currentValue = read(key, fallback);
      var nextValue = updater(cloneValue(currentValue));
      write(key, nextValue);
      return cloneValue(nextValue);
    }

    function flush(key) {
      if (key !== undefined) {
        return flushKey(buildKey(key));
      }

      pendingWrites.forEach(function eachPending(_, fullKey) {
        flushKey(fullKey);
      });

      return true;
    }

    function hasPendingWrite(key) {
      if (key !== undefined) {
        return pendingWrites.has(buildKey(key));
      }
      return pendingWrites.size > 0;
    }

    function getKey(productId, key) {
      var prefix = String(productId || "").trim();
      return prefix ? prefix + ":" + key : String(key);
    }

    function readScoped(productId, key, fallback) {
      return read(getKey(productId, key), fallback);
    }

    function writeScoped(productId, key, value) {
      return write(getKey(productId, key), value);
    }

    function removeScoped(productId, key) {
      return remove(getKey(productId, key));
    }

    function migrateScoped(productId, migrations) {
      var migrationList = Array.isArray(migrations) ? migrations : [];
      var versionKey = getKey(productId, "__version__");
      var currentVersion = Number(read(versionKey, version));

      migrationList
        .filter(function filterMigration(item) {
          return item && Number.isFinite(item.version) && item.version > currentVersion && typeof item.run === "function";
        })
        .sort(function sortMigration(a, b) {
          return a.version - b.version;
        })
        .forEach(function runMigration(migration) {
          migration.run({
            productId: productId,
            readScoped: readScoped,
            writeScoped: writeScoped,
            removeScoped: removeScoped,
            flush: flush
          });
          write(versionKey, migration.version);
        });

      return Number(read(versionKey, version));
    }

    return {
      namespace: namespace,
      version: version,
      debounceMs: debounceMs,
      read: read,
      write: write,
      remove: remove,
      update: update,
      flush: flush,
      hasPendingWrite: hasPendingWrite,
      getKey: getKey,
      readScoped: readScoped,
      writeScoped: writeScoped,
      removeScoped: removeScoped,
      migrateScoped: migrateScoped
    };
  }

  var root = ensureRoot();
  root.storage = {
    createStorage: createStorage,
    DEFAULT_DEBOUNCE_MS: DEFAULT_DEBOUNCE_MS
  };
})(window);
