/* ═══════════════════════════════════════════
   MLB BALLPARKS QUEST · DEVICE DETECTION
   device.js — include on every page
═══════════════════════════════════════════ */

(function() {
  'use strict';

  function detectDevice() {
    const ua = navigator.userAgent || '';
    const isIPad =
      /iPad/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isPhone = /iPhone|Android.*Mobile|BlackBerry|IEMobile/.test(ua);
    const hasTouch = navigator.maxTouchPoints > 0;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const hover = window.matchMedia('(hover: hover)').matches;

    if (isIPad) return 'ipad';
    if (isPhone) return 'mobile';
    if (fine && hover && !hasTouch) return 'desktop';
    if (coarse && hasTouch) return 'touch';
    return 'desktop';
  }

  function detectViewport() {
    const w = window.innerWidth;
    if (w >= 1200) return 'xl';
    if (w >= 900) return 'lg';
    if (w >= 640) return 'md';
    return 'sm';
  }

  function getLayout(device, viewport) {
    if (device === 'ipad' || (device === 'touch' && viewport === 'lg')) return 'ipad';
    if (device === 'mobile' || viewport === 'sm') return 'mobile';
    return 'desktop';
  }

  function applyDeviceAttributes() {
    const root = document.documentElement;
    const body = document.body;
    if (!body) return;

    const device = detectDevice();
    const viewport = detectViewport();
    const layout = getLayout(device, viewport);

    [root, body].forEach((node) => {
      node.dataset.device = device;
      node.dataset.viewport = viewport;
      node.dataset.layout = layout;
      if (!node.dataset.input) node.dataset.input = 'default';
    });
  }

  function setInputMode(value) {
    const root = document.documentElement;
    const body = document.body;
    if (root) root.dataset.input = value;
    if (body) body.dataset.input = value;
  }

  function bindPointerMode() {
    window.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'pen') {
        setInputMode('pen');
        document.dispatchEvent(new CustomEvent('penDetected', { detail: { pressure: event.pressure } }));
      } else if (event.pointerType === 'touch') {
        setInputMode('touch');
      } else if (event.pointerType === 'mouse') {
        setInputMode('mouse');
      }
    }, { passive: true });
  }

  function bindResizeRefresh() {
    let frame = null;
    window.addEventListener('resize', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyDeviceAttributes());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyDeviceAttributes();
    bindPointerMode();
    bindResizeRefresh();
  });

  window.BPQ = window.BPQ || {};
  window.BPQ.device = detectDevice;
  window.BPQ.viewport = detectViewport;
})();
