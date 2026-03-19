(function () {
  if (!window.THEME_REGISTRY || typeof window.setTheme !== "function") {
    return;
  }

  const root = document.documentElement;
  const wrapper = document.createElement("div");
  wrapper.className = "theme-switcher";
  wrapper.innerHTML = `
    <button class="theme-switcher__trigger" type="button" aria-expanded="false" aria-controls="theme-switcher-panel">
      Theme
    </button>
    <section class="theme-switcher__panel" id="theme-switcher-panel" hidden aria-label="Theme picker">
      <div class="theme-switcher__header">Choose theme</div>
      <div class="theme-switcher__list" role="group" aria-label="Available themes"></div>
    </section>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .theme-switcher{
      position:fixed;
      right:18px;
      bottom:18px;
      z-index:30;
      display:grid;
      justify-items:end;
      gap:10px;
    }
    .theme-switcher__trigger{
      min-height:46px;
      padding:0 16px;
      border-radius:999px;
      border:1px solid color-mix(in srgb, var(--ink) 12%, transparent);
      background:var(--panel-strong);
      color:var(--ink);
      cursor:pointer;
      font:inherit;
      font-weight:700;
      box-shadow:var(--shadow);
    }
    .theme-switcher__panel{
      width:min(280px, calc(100vw - 36px));
      padding:14px;
      border-radius:18px;
      border:1px solid color-mix(in srgb, var(--ink) 10%, transparent);
      background:var(--theme-panel-overlay);
      box-shadow:var(--shadow);
    }
    .theme-switcher__header{
      margin-bottom:10px;
      color:var(--muted);
      font-size:.76rem;
      font-weight:700;
      letter-spacing:.1em;
      text-transform:uppercase;
    }
    .theme-switcher__list{
      display:grid;
      gap:8px;
    }
    .theme-switcher__option{
      display:grid;
      grid-template-columns:14px minmax(0, 1fr);
      align-items:center;
      gap:10px;
      min-height:44px;
      width:100%;
      padding:10px 12px;
      border-radius:14px;
      border:1px solid color-mix(in srgb, var(--ink) 10%, transparent);
      background:var(--panel-strong);
      color:var(--ink);
      cursor:pointer;
      text-align:left;
      font:inherit;
      font-weight:600;
    }
    .theme-switcher__option[aria-pressed="true"]{
      border-color:color-mix(in srgb, var(--accent) 45%, transparent);
      box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .theme-switcher__swatch{
      width:14px;
      height:14px;
      border-radius:999px;
      border:1px solid color-mix(in srgb, var(--ink) 18%, transparent);
    }
    .theme-switcher__trigger:focus-visible,
    .theme-switcher__option:focus-visible{
      outline:3px solid color-mix(in srgb, var(--accent) 28%, transparent);
      outline-offset:3px;
    }
    @media (max-width: 600px){
      .theme-switcher{
        top:18px;
        right:18px;
        bottom:auto;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(wrapper);

  const trigger = wrapper.querySelector(".theme-switcher__trigger");
  const panel = wrapper.querySelector(".theme-switcher__panel");
  const list = wrapper.querySelector(".theme-switcher__list");

  function renderOptions() {
    const activeTheme = root.getAttribute("data-theme") || "phillies";
    list.innerHTML = window.THEME_REGISTRY.map((theme) => `
      <button
        class="theme-switcher__option"
        type="button"
        data-theme-option="${theme.key}"
        aria-pressed="${theme.key === activeTheme ? "true" : "false"}"
      >
        <span class="theme-switcher__swatch" style="background:${theme.swatch}"></span>
        <span>${theme.label}</span>
      </button>
    `).join("");
  }

  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const firstButton = list.querySelector(".theme-switcher__option");
    if (firstButton) firstButton.focus();
  }

  function togglePanel() {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  }

  trigger.addEventListener("click", togglePanel);

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-option]");
    if (!button) return;
    window.setTheme(button.getAttribute("data-theme-option"));
  });

  document.addEventListener("themechange", renderOptions);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
      trigger.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (panel.hidden) return;
    if (wrapper.contains(event.target)) return;
    closePanel();
  });

  renderOptions();
})();
