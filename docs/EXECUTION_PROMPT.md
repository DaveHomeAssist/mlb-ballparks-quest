# MLB Ballparks Quest — Execution Prompt

> **Scope:** Full implementation across UX audit (15 findings), design review (8 recommendations), and implementation contracts (10 features)
> **Architecture:** Two static HTML pages with inline CSS/JS + theme-tokens.css + theme-switcher.js/ui.js
> **Constraint:** No framework, no build step, static hosting, localStorage only
> **Estimated total:** 3 focused days

---

## Wave 1: Safety & Feedback Foundation (4 hours)

**Model: Claude**
**Why Claude:** State design, undo patterns, validation logic, toast architecture that other waves depend on.

```text
MLB Ballparks Quest — Wave 1: Safety & Feedback Foundation

You are working on two static HTML files with inline CSS/JS. No framework, no build step.
Read both files fully before making any changes.

Files:
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/scorekeeper.html (~1580 lines)
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/index.html (~1031 lines)

You are making 6 changes. All subsequent waves depend on the toast system from change 1.

═══ 1. TOAST NOTIFICATION SYSTEM (both pages) ═══

Add to both pages. Identical implementation, duplicated in each file's <style> and <script>.

Runtime model:
  let activeToast = null;
  let activeToastTimer = null;

Function signature:
  showToast(message, tone = 'info', duration = 3200, actionLabel = '', onAction = null)

Tones: 'info' (neutral), 'success' (green left border), 'error' (red left border), 'undo' (gold left border + action button)

HTML structure (created dynamically):
  <section class="toast is-{tone}" role="{tone === 'error' ? 'alert' : 'status'}" aria-live="polite">
    <div class="toast-copy">{escaped message}</div>
    <div class="toast-actions">
      {actionLabel ? <button class="toast-action">{escaped actionLabel}</button> : ''}
      <button class="toast-close" aria-label="Dismiss">×</button>
    </div>
  </section>

CSS:
  .toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
    z-index: 300; background: var(--surface, #fff); border: 1px solid var(--border);
    border-left-width: 4px; border-radius: var(--radius, 14px); padding: 12px 16px;
    display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow);
    font-family: inherit; font-size: 14px; color: var(--ink, #1a2233);
    animation: toastIn 200ms ease-out; max-width: min(440px, 90vw); }
  .toast.is-info { border-left-color: var(--accent); }
  .toast.is-success { border-left-color: #2d6a4f; }
  .toast.is-error { border-left-color: #c44; }
  .toast.is-undo { border-left-color: var(--gold, #c9882f); }
  .toast-copy { flex: 1; line-height: 1.4; }
  .toast-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .toast-action { background: none; border: 1.5px solid var(--accent); color: var(--accent);
    border-radius: 999px; padding: 4px 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .toast-close { background: none; border: none; font-size: 18px; cursor: pointer;
    color: var(--muted); padding: 0 4px; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }

Behavior:
  - Only one toast visible at a time (clearToast before showing new)
  - Action button calls onAction then clearToast
  - Close button calls clearToast
  - Auto-dismiss after duration (0 = no auto-dismiss)
  - clearToast removes element from DOM and clears timer

═══ 2. RESET UNDO (scorekeeper.html) ═══

Find the reset button handler (els.resetBtn click listener).
Current: creates new game immediately with no warning.

Replace with:
  1. Save snapshot: const snapshot = clone(state.game);
  2. Execute reset: state.game = createNewGame(); saveGame(); render();
  3. Show undo toast: showToast('Game reset', 'undo', 5000, 'Undo', () => {
       state.game = snapshot; syncLibrary(); saveGame(); render();
     });

═══ 3. GAME DELETE UNDO (scorekeeper.html) ═══

Find the game delete handler in the games list (button with remove action).

Replace with:
  1. Save snapshot: const removed = clone(game); const idx = library index;
  2. Execute delete: splice from library, switch to another game or create new, saveGame(), render();
  3. Show undo toast: showToast('Game removed', 'undo', 5000, 'Undo', () => {
       state.library.games.splice(idx, 0, removed); syncLibrary(); saveGame(); render();
     });

Edge case: if deleting the only game, create a fresh game after delete.
Edge case: if deleting the active game, switch to the first remaining game.

═══ 4. IMPORT SCHEMA VALIDATION (scorekeeper.html) ═══

Add before the existing replayGame call in the import handler:

  function validateGameImport(obj) {
    const errors = [];
    if (!obj || typeof obj !== 'object' || Array.isArray(obj))
      return { ok: false, errors: ['Not a valid game object'] };
    if (typeof obj.awayName !== 'string' || !obj.awayName.trim())
      errors.push('Missing away team name');
    if (typeof obj.homeName !== 'string' || !obj.homeName.trim())
      errors.push('Missing home team name');
    if (!Array.isArray(obj.plays))
      errors.push('Missing plays array');
    else obj.plays.forEach((p, i) => {
      if (!p || !EVENTS[p.event]) errors.push('Play ' + (i+1) + ': unknown event');
    });
    if (!obj.state || typeof obj.state !== 'object')
      errors.push('Missing game state');
    return { ok: errors.length === 0, errors };
  }

In import handler:
  - Parse JSON (existing try/catch)
  - Call validateGameImport(parsed)
  - If !ok: showToast('Import failed: ' + errors[0], 'error', 6000); return;
  - If ok: proceed with replayGame, then showToast('Game imported', 'success');

═══ 5. STORAGE FAILURE FEEDBACK (both pages) ═══

In every try/catch around localStorage.setItem:
  catch: showToast('Save failed — storage may be full. Export your data.', 'error', 0);

In scorekeeper saveGame():
  Add try/catch if not present. On catch: show error toast.

In index.html writeScorekeeperImport():
  Add try/catch if not present. On catch: show error toast.

═══ 6. SAVE STATUS CHIP (scorekeeper.html) ═══

Add a <span id="saveStatusChip" class="save-chip"></span> in the toolbar area.

CSS:
  .save-chip { font-size: 12px; font-family: inherit; padding: 2px 8px;
    border-radius: 999px; transition: opacity 300ms ease; opacity: 0; }
  .save-chip.is-saved { opacity: 1; color: #2d6a4f; background: rgba(45,106,79,.08); }
  .save-chip.is-error { opacity: 1; color: #c44; background: rgba(204,68,68,.08); }

State machine:
  let _saveChipTimer = null;
  After successful save: set chip text "Saved ✓", class is-saved, clear after 2s.
  After failed save: set chip text "Save failed", class is-error, do not auto-clear.
  On next successful save after failure: clear error, show saved.

Use escapeHtml() for all dynamic content. Match existing CSS variable names.
Do not add any external dependencies.
```

---

## Wave 2: Tracker Interactivity (3 hours)

**Model: Claude**
**Why Claude:** localStorage state design, merge logic, computed route targets, cross-page handoff.

```text
MLB Ballparks Quest — Wave 2: Tracker Interactivity

File: /Users/daverobertson/Desktop/Code/20-prototypes/MLB/index.html (~1031 lines)
File: /Users/daverobertson/Desktop/Code/20-prototypes/MLB/scorekeeper.html (for return handoff)

Depends on: Wave 1 toast system must be present in both files.

You are making 4 changes to the tracker page and 1 to the scorekeeper.

═══ 1. VISITED STATE PERSISTENCE ═══

Add localStorage key: mlb_visited_parks_v1

Data shape:
  { version: 1, parks: { "3": { visitDate: "2023-07-15", rating: 5, notes: "...", bestFeature: "...", markedAt: "2026-03-18T14:30:00Z" } } }

Functions to add:
  function getVisitedStore() — read + parse, return { version: 1, parks: {} } on missing/corrupt
  function saveVisitedStore(store) — JSON.stringify + setItem, toast on failure
  function isVisited(parkId) — check localStorage first, then hardcoded PARKS fallback
  function getVisitData(parkId) — return localStorage override or hardcoded visit data or null
  function toggleVisited(parkId) — if visited: remove from store. if not: add with visitDate=today.

On page load:
  - If key missing, seed from PARKS entries where visited === true, then write key
  - Merge localStorage state into all render paths

Add to park detail panel:
  - Button: "Mark as Visited" (if not visited) or "Visited ✓ [date]" with "Remove" link (if visited)
  - On toggle: saveVisitedStore(), re-render park list + detail + progress + highlights + route

Update progress counters:
  - visitedCount, remainingCount, visitedHeroCount use isVisited() instead of hardcoded .visited

Update highlights section:
  - Sort visited parks by markedAt descending, show top 4
  - If 0 visited: show empty state card "No parks visited yet — score your first game to start building your ballpark collection."

Update park list filter:
  - "Visited" / "Not visited" filter uses isVisited() instead of hardcoded .visited

Edge cases:
  - localStorage cleared: falls back to hardcoded visited state
  - Rapid double-toggle: last write wins, re-render is idempotent
  - Storage full: toast warning, in-memory state still reflects toggle

═══ 2. DYNAMIC ROUTE TARGETS ═══

Delete: const NEXT_TARGETS = [22, 19, 14];

Replace with:
  function getNextTargets(count) {
    count = count || 3;
    return PARKS.filter(function(p) { return !isVisited(p.id); })
      .sort(function(a, b) { return priorityScore(b) - priorityScore(a); })
      .slice(0, count)
      .map(function(p) { return p.id; });
  }

priorityScore uses existing algorithm (tier bonus + age bonus).
Remove the visited penalty from priorityScore (isVisited filter handles it).

Update route render to call getNextTargets() instead of reading NEXT_TARGETS.

When all 30 visited:
  Route section shows completion card:
  <article class="section-card" style="text-align:center">
    <div style="font-size:48px">🏟️</div>
    <h3>All 30 Parks Visited</h3>
    <p>You've been to every active MLB ballpark. Time for a victory lap.</p>
  </article>

On park visited toggle: re-render route section.

═══ 3. SCOREKEEPER RETURN HANDOFF ═══

New localStorage key: mlb_scorekeeper_return_v1

Shape:
  { version: 1, exportedAt: "ISO", gameId: "game-xxx", parkId: 22,
    result: { awayName, homeName, awayRuns, homeRuns, innings, status } }

Scorekeeper change (scorekeeper.html):
  In the finalize handler (where status is set to "final"):
  - If state.game.importedVenue and state.game.importedVenue.id:
    Write return payload to mlb_scorekeeper_return_v1
  - Include game result (compute runs from plays)

Tracker change (index.html):
  On page load, after visited store is initialized:
  - Read mlb_scorekeeper_return_v1
  - If valid and parkId matches a PARKS entry:
    - If park not visited: show banner at top of page:
      "You scored a game at [Stadium]. Mark as visited?"
      Buttons: [Mark Visited] [Not now]
    - If park already visited: showToast('[Stadium] game logged ✓', 'info')
  - "Mark Visited": toggleVisited(parkId), clear return key, re-render
  - "Not now": dismiss banner (keep return key for next load)

═══ 4. CLEAR IMPORTED VENUE ON NEW GAME ═══

In scorekeeper.html createNewGame():
  Do NOT copy importedVenue from the previous game.
  Set importedVenue: null on fresh games.

In render, when active game changes:
  Re-read import payload from localStorage fresh.
  Do not carry imported venue across game switches.

═══ 5. GAME TITLE FIELD ═══

Add to scorekeeper setup section, after venue input:
  <label>Game title <span style="opacity:.5">(optional)</span>
    <input id="gameTitle" class="setup-input" placeholder="e.g. Opening Day 2026">
  </label>

In createNewGame(): add title: '' (already present from seed, confirm it works)

In getGameLabel(game):
  return (game.title || '').trim() || (game.awayName || 'Away') + ' at ' + (game.homeName || 'Home');

Bind: els.gameTitle input → state.game.title = value, saveGame()
Render: populate gameTitle input from state.game.title on game switch

Export: title field included in JSON export (already in game object)
Import: title preserved through replayGame (already copies from seed)

Use escapeHtml() for all dynamic content.
```

---

## Wave 3: Design Elevation (4 hours)

**Model: Codex**
**Why Codex:** Mechanical CSS changes, font import, class additions, animation keyframes — all from clear specs.

```text
MLB Ballparks Quest — Wave 3: Design Elevation

Files:
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/index.html
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/scorekeeper.html
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/theme-tokens.css

You are making 6 CSS/HTML changes. No JS logic changes.

═══ 1. DISPLAY SERIF FONT ═══

Add to both pages' <head>, before existing <style>:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">

Add to both pages' CSS:
  .display-serif { font-family: 'Playfair Display', 'Palatino Linotype', Georgia, serif; }

Apply .display-serif to:
  - index.html: hero h1, .section-kicker elements, route card h3
  - scorekeeper.html: hero h1, .section-kicker elements, #scoreboardTitle, game library card titles
  - Keep all body text, labels, inputs, and metadata as system sans-serif

═══ 2. SCOREBOOK ELEVATION ═══

In scorekeeper.html CSS, make the score table section the visual focal point:

  #scoreboard {
    background: color-mix(in srgb, var(--bg) 92%, var(--accent) 8%);
    border: 2px solid color-mix(in srgb, var(--accent) 20%, transparent);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-lg, 0 16px 50px rgba(10,35,66,.12));
  }

  #scoreboardTitle {
    font-size: clamp(1.4rem, 3vw, 1.8rem);
    letter-spacing: -0.01em;
  }

  /* Reduce visual weight of supporting sections */
  #setup, #lineup, #controls {
    opacity: 0.92;
  }
  #setup:focus-within, #lineup:focus-within, #controls:focus-within {
    opacity: 1;
  }

═══ 3. SCORING MICRO-FEEDBACK ═══

Add to scorekeeper.html CSS:

  @keyframes play-pulse {
    0% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .event-btn:active {
    animation: play-pulse 60ms ease-out;
  }

  @keyframes score-flash {
    from { background: color-mix(in srgb, var(--accent) 15%, transparent); }
    to { background: transparent; }
  }
  .score-cell.just-scored {
    animation: score-flash 300ms ease-out;
  }

  .game-final #scoreboard {
    border-top: 3px solid var(--gold, var(--accent));
  }

  @media (prefers-reduced-motion: reduce) {
    .event-btn:active { animation: none; }
    .score-cell.just-scored { animation: none; }
  }

In JS: after applyEvent renders the score table, find the cell that changed and add
class "just-scored". Remove it after 350ms with setTimeout.

═══ 4. FOCUS OUTLINE CONTRAST ═══

In both pages, replace the existing :focus-visible rule:

  Before: outline: 3px solid rgba(161,44,33,.32);
  After:  outline: 3px solid color-mix(in srgb, var(--accent) 72%, white 8%);

This inherits the theme accent color and maintains ≥3:1 contrast across all 5 themes.

If color-mix is unsupported, add fallback:
  outline: 3px solid var(--accent);

═══ 5. TIER COLOR TOKENS ═══

In theme-tokens.css, add to EACH theme block:

  [data-theme="phillies"] {
    /* existing tokens... */
    --tier-s-ink: #8a6d14; --tier-s-bg: rgba(138,109,20,.12);
    --tier-a-ink: #1a5c3a; --tier-a-bg: rgba(26,92,58,.10);
    --tier-b-ink: #1a5a8f; --tier-b-bg: rgba(26,90,143,.08);
    --tier-c-ink: #6b7280; --tier-c-bg: rgba(107,114,128,.08);
  }

Repeat for eagles, flyers, sixers, union with palette-appropriate values.

In index.html JS, replace hardcoded TIERS object colors:
  Before:
    const TIERS = {
      S: { color: "#c58d1a", bg: "rgba(212,169,63,.16)" },
      ...
    };

  After:
    function getTierStyle(tier) {
      const s = getComputedStyle(document.documentElement);
      const t = tier.toLowerCase();
      return {
        color: s.getPropertyValue('--tier-' + t + '-ink').trim() || '#666',
        bg: s.getPropertyValue('--tier-' + t + '-bg').trim() || 'rgba(0,0,0,.05)'
      };
    }

Update all pill rendering to call getTierStyle() instead of TIERS[tier].

═══ 6. KEYBOARD SHORTCUTS ═══

In scorekeeper.html, add keydown listener at end of <script>:

  document.addEventListener('keydown', function(e) {
    var mod = e.metaKey || e.ctrlKey;
    var inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
    if (mod && e.key === 'z') { e.preventDefault(); /* trigger existing undo handler */ return; }
    if (inField) return;
    if (e.key === 'Escape') { clearToast(); return; }
  });

In index.html, add keydown listener at end of <script>:

  document.addEventListener('keydown', function(e) {
    var inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
    if (inField) return;
    if (e.key === '/') { e.preventDefault(); document.getElementById('searchInput').focus(); return; }
    if (e.key === 'Escape') { state.activeParkId = null; render(); return; }
  });

Add <kbd> hints:
  - Undo button text: "↩ Undo <kbd>⌘Z</kbd>"
  - Search placeholder: "Team, stadium, or city (/)"

Add kbd CSS to both pages:
  kbd { font-family: inherit; font-size: 0.75em; background: rgba(0,0,0,.06);
    padding: 1px 5px; border-radius: 3px; margin-left: 3px; opacity: 0.6; }

Match existing CSS variables. Do not add any external dependencies.
```

---

## Wave 4: Empty States, Auto-Scroll, Lineup Guidance (2 hours)

**Model: Codex**
**Why Codex:** Template HTML additions with clear before/after specs.

```text
MLB Ballparks Quest — Wave 4: Empty States & Polish

Files:
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/index.html
- /Users/daverobertson/Desktop/Code/20-prototypes/MLB/scorekeeper.html

You are making 4 targeted HTML/JS changes.

═══ 1. HIGHLIGHTS EMPTY STATE (index.html) ═══

In the render function where highlights are populated (visited.slice(0,4)):
If visited.length === 0, render instead:

  <article class="section-card" style="text-align:center;padding:32px">
    <div style="font-size:40px;margin-bottom:8px">🏟️</div>
    <h3>No parks visited yet</h3>
    <p>Score your first game to start building your ballpark collection.</p>
  </article>

═══ 2. PLAY LOG AUTO-SCROLL (scorekeeper.html) ═══

Add module-level variable:
  let lastRenderedPlayCount = 0;

After the play log HTML is written to DOM in the render function:
  if (state.game && state.game.plays.length > lastRenderedPlayCount) {
    els.playLog.scrollTo({ top: 0, behavior: 'smooth' });
  }
  lastRenderedPlayCount = state.game ? state.game.plays.length : 0;

Guard: do not scroll on game switch (plays.length may jump from 0 to N).
Reset lastRenderedPlayCount to 0 when switching games.

═══ 3. LINEUP GUIDANCE (scorekeeper.html) ═══

Find the lineup section guidance text "Set both batting orders before first pitch".
Replace with: "Lineups are optional. Empty slots appear as numbered placeholders."

Add one-time tip on first scoring action:
  const LINEUP_TIP_KEY = 'mlb_scorekeeper_lineup_tip_v1';
  In the event button handler, before the first play is applied:
  if (state.game.plays.length === 0) {
    var allDefault = state.game.lineups.away.every(function(n) { return !n.trim(); })
      && state.game.lineups.home.every(function(n) { return !n.trim(); });
    if (allDefault && !localStorage.getItem(LINEUP_TIP_KEY)) {
      showToast('Tip: Fill in lineups for better play-by-play detail', 'info', 5000);
      try { localStorage.setItem(LINEUP_TIP_KEY, '1'); } catch(e) {}
    }
  }

═══ 4. COPY TONE PASS (both pages) ═══

Rewrite these specific text strings to match the brand voice (warm, aspirational, baseball-native):

index.html:
  - Footer: "Standalone tracker..." → "Built for the road. No account needed."
  - Search placeholder: "Team, stadium, or city" → "Search parks, teams, or cities (/)"
  - Results count: add "parks" label: "30 parks" not just "30"

scorekeeper.html:
  - Footer: "Standalone scorekeeper..." → "Your personal scorebook. Works anywhere."
  - Play log subtitle: "The log doubles as the audit trail for undo and JSON export"
    → "Every play, every inning, in order."
  - Import card empty: add warmth: "Open a park in Ballparks Quest and tap the scorekeeper link to import venue details."
  - Export button area: "JSON" → "Export Game" and "Notes" → "Export Notes"

Use escapeHtml() for any dynamic content. Do not change functional behavior.
```

---

## Wave Summary

| Wave | Model | Time | Delivers |
|------|-------|------|----------|
| 1 | Claude | 4h | Toast system, reset undo, delete undo, import validation, storage feedback, save chip |
| 2 | Claude | 3h | Visited persistence, dynamic route, return handoff, venue clearing, game title |
| 3 | Codex | 4h | Display serif, scorebook elevation, scoring feedback, focus contrast, tier tokens, keyboard shortcuts |
| 4 | Codex | 2h | Empty states, auto-scroll, lineup guidance, copy tone |

**Total: ~13 hours across 4 waves. Waves 1-2 are sequential (2 depends on 1). Waves 3-4 are parallel with each other and can start after Wave 1.**

---

## Traceability

| Source | Finding | Wave | Task |
|--------|---------|------|------|
| UX Audit S1-1 | Reset no confirmation | 1 | Reset undo |
| UX Audit S1-2 | No toast system | 1 | Toast system |
| UX Audit S1-3 | Import no validation | 1 | Import validation |
| UX Audit S1-4 | Storage failures silent | 1 | Storage feedback |
| UX Audit S2-5 | No mark-as-visited | 2 | Visited persistence |
| UX Audit S2-6 | Highlights empty state | 4 | Highlights empty |
| UX Audit S2-7 | Imported venue persists | 2 | Venue clearing |
| UX Audit S2-8 | Play log no auto-scroll | 4 | Auto-scroll |
| UX Audit S2-9 | Route shows visited | 2 | Dynamic route |
| UX Audit S2-10 | Game delete no confirm | 1 | Delete undo |
| UX Audit S3-11 | No game title | 2 | Game title |
| UX Audit S3-12 | Focus contrast | 3 | Focus outline |
| UX Audit S3-13 | No keyboard shortcuts | 3 | Keyboard shortcuts |
| UX Audit S3-14 | Tier colors hardcoded | 3 | Tier tokens |
| UX Audit S3-15 | Lineup guidance | 4 | Lineup guidance |
| Design R1 | Display serif | 3 | Display font |
| Design R3 | Scorebook elevation | 3 | Scorebook CSS |
| Design R6 | Scoring micro-feedback | 3 | Score flash |
| Design R7 | Copy tone | 4 | Copy pass |
| Contract 3 | Return handoff | 2 | Return handoff |
| Contract 4 | Save status | 1 | Save chip |
| Contract 7 | Game library search | — | Deferred to Wave 5 |
| Contract 8 | Toast system | 1 | Toast system |

**30 items addressed. 1 deferred (library search/sort — Wave 5 when library exceeds 10 games).**
