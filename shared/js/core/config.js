(function attachQuestPlatformConfig(global) {
  "use strict";

  var ROOT_KEY = "__QUEST_PLATFORM__";
  var PRODUCT_REGISTRY = Object.create(null);

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

  function registerProduct(productId, config) {
    if (!productId) {
      throw new Error("registerProduct(productId, config) requires a productId");
    }
    PRODUCT_REGISTRY[productId] = cloneValue(config || {});
    return getProductConfig(productId);
  }

  function getProductConfig(productId) {
    if (!PRODUCT_REGISTRY[productId]) return null;
    return cloneValue(PRODUCT_REGISTRY[productId]);
  }

  function requireProductConfig(productId) {
    var config = getProductConfig(productId);
    if (!config) {
      throw new Error("Unknown product config: " + productId);
    }
    return config;
  }

  function listProducts() {
    return Object.keys(PRODUCT_REGISTRY).sort();
  }

  function createProductConfig(options) {
    var settings = options || {};
    var productId = String(settings.productId || "").trim();
    var productCode = String(settings.productCode || productId || "").trim();

    if (!productId) {
      throw new Error("createProductConfig requires productId");
    }

    return {
      productId: productId,
      productCode: productCode,
      appName: settings.appName || productId,
      namespace: settings.namespace || productCode,
      storage: cloneValue(settings.storage || {}),
      entities: cloneValue(settings.entities || {}),
      schedule: cloneValue(settings.schedule || {}),
      route: cloneValue(settings.route || {}),
      theme: cloneValue(settings.theme || {}),
      features: cloneValue(settings.features || {}),
      ui: cloneValue(settings.ui || {})
    };
  }

  var root = ensureRoot();
  root.config = {
    createProductConfig: createProductConfig,
    registerProduct: registerProduct,
    getProductConfig: getProductConfig,
    requireProductConfig: requireProductConfig,
    listProducts: listProducts
  };
})(window);
