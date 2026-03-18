# MLB Ballparks Quest — UX Audit Implementation Plan

> **Source:** UX_AUDIT_2026-03-18.md (15 findings: 4 critical, 6 high, 5 medium)
> **Architecture:** Two static HTML pages (index.html tracker + scorekeeper.html scorer) with inline CSS/JS
> **Constraint:** No framework, no build step, static hosting, localStorage persistence

---

## Batch Overview

| Batch | Type | Findings Covered | Files | Model |
|-------|------|-----------------|-------|-------|
| A | Data safety & destructive guards | S1-1, S1-2, S1-3, S1-4, S2-10 | scorekeeper.html | Claude |
| B | Feedback & empty states | S2-6, S2-8, S3-11 | scorekeeper.html, index.html | Codex |
| C | Tracker interactivity | S2-5, S2-9, S2-7 | index.html | Claude |
| D | Accessibility & polish | S3-12, S3-13, S3-14, S3-15 | Both pages, theme-tokens.css | Codex |

---

## Batch A — Data Safety & Destructive Guards

**Findings addressed:**
- S1-1: Reset button has no confirmation dialog
- S1-2: No toast/notification system exists
- S1-3: JSON import has no schema validation
- S1-4: localStorage failures are console-only
- S2-10: Game delete has no confirmation

### A1. Toast notification system (S1-2)

**Problem:** Export, import, save, error actions produce zero user-facing feedback across both pages.

**Implementation:**
1. Add `showToast(message, tone='info', duration=3000)` function to both pages
2. Toast renders as a fixed-position bar at bottom-center with fade-in/fade-out animation
3. Tones: `info` (neutral), `success` (green border), `error` (red border), `undo` (with action button)
4. CSS: `.toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); z-index:300; ... }`
5. Auto-dismiss after duration. Clicking X dismisses early.
6. For undo variant: `showToast('Game deleted', 'undo', 5000, () => restoreGame(snapshot))`

**Files:** scorekeeper.html (new function + CSS), index.html (new function + CSS)

### A2. Reset button confirmation (S1-1)

**Problem:** Single click wipes entire game with no warning.

**Implementation:**
1. In scorekeeper.html reset handler (line ~1544), wrap in: `if (!confirm('Clear this game and start fresh? This cannot be undone.')) return;`
2. After reset, call `showToast('Game reset', 'info')`
3. Consider undo variant: save pre-reset snapshot, offer 5s undo toast instead of confirm

**Files:** scorekeeper.html (reset handler)

### A3. Game delete confirmation (S2-10)

**Problem:** Remove button in games list triggers immediate delete with no recovery.

**Implementation:**
1. Before `splice()` in delete handler, save the removed game object
2. Remove from library and re-render
3. Show undo toast: `showToast('Game removed', 'undo', 5000, () => { library.games.push(saved); syncLibrary(); render(); })`

**Files:** scorekeeper.html (game delete handler)

### A4. JSON import schema validation (S1-3)

**Problem:** Invalid file structure silently creates broken game via `replayGame()`.

**Implementation:**
1. Before calling `replayGame(parsed)`, validate shape:
   ```js
   function validateGameImport(obj) {
     if (!obj || typeof obj !== 'object') return { ok: false, reason: 'Not a valid object' };
     if (!Array.isArray(obj.plays)) return { ok: false, reason: 'Missing plays array' };
     if (!obj.state || typeof obj.state !== 'object') return { ok: false, reason: 'Missing game state' };
     if (typeof obj.awayName !== 'string') return { ok: false, reason: 'Missing away team name' };
     if (typeof obj.homeName !== 'string') return { ok: false, reason: 'Missing home team name' };
     return { ok: true };
   }
   ```
2. On validation failure, show `showToast(reason, 'error')` and abort import
3. On success, proceed with `replayGame()` and show `showToast('Game imported', 'success')`

**Files:** scorekeeper.html (import handler)

### A5. localStorage failure feedback (S1-4)

**Problem:** Storage full or quota exceeded — user loses progress with only console error.

**Implementation:**
1. In `saveGame()` try/catch, on error: `showToast('Save failed — storage may be full. Export your data.', 'error', 8000)`
2. In `writeScorekeeperImport()` try/catch on tracker side: `showToast('Could not prepare scorekeeper handoff', 'error')`
3. Both pages: wrap all `localStorage.setItem` calls with error feedback

**Files:** scorekeeper.html (saveGame), index.html (writeScorekeeperImport)

---

## Batch B — Feedback & Empty States

**Findings addressed:**
- S2-6: Highlights section has no empty state
- S2-8: Play log doesn't auto-scroll to latest play
- S3-11: No game title field

### B1. Highlights empty state (S2-6)

**Problem:** When 0 parks visited, highlights section renders nothing.

**Implementation:**
1. In index.html render (line ~874-889), check `if (visited.length === 0)`
2. Render card: `<div class="section-card"><div class="section-kicker">Highlights</div><h3>No parks visited yet</h3><p>Score your first game to start building your ballpark collection.</p></div>`
3. Match existing section-card styling

**Files:** index.html (highlights render)

### B2. Play log auto-scroll (S2-8)

**Problem:** Log is reverse-sorted but doesn't scroll to top on new play.

**Implementation:**
1. After rendering play log in `render()`, scroll the log container to top:
   ```js
   const logEl = document.getElementById('playLog');
   if (logEl) logEl.scrollTo({ top: 0, behavior: 'smooth' });
   ```
2. Only scroll when a new play was just added (check plays.length changed vs last render)

**Files:** scorekeeper.html (render function, after play log HTML update)

### B3. Game title field (S3-11)

**Problem:** Auto-generated "Away at Home" makes games indistinguishable in library.

**Implementation:**
1. Add optional title input to game setup section: `<label>Game title (optional)<input id="gameTitle" placeholder="e.g. Spring Training 3/15"></label>`
2. In `createNewGame()`, set `title: ''`
3. In `getGameLabel()`, return `game.title || \`${game.awayName} at ${game.homeName}\``
4. Bind input change to `state.game.title = event.target.value; saveGame()`
5. On render, populate input from `state.game.title`

**Files:** scorekeeper.html (HTML, createNewGame, getGameLabel, render, input binding)

---

## Batch C — Tracker Interactivity

**Findings addressed:**
- S2-5: No way to mark parks as visited from tracker
- S2-9: Route preview shows "Visited" for completed targets
- S2-7: Imported venue persists across new games

### C1. Mark as Visited toggle (S2-5)

**Problem:** Visit status hardcoded in PARKS array; can't update from UI.

**Implementation:**
1. Add localStorage key `mlb_visited_parks_v1` storing `{ [parkId]: { visitDate: 'YYYY-MM-DD', rating: number } }`
2. On page load, merge localStorage visited data with hardcoded PARKS array
3. Add "Mark as Visited" / "Mark as Unvisited" toggle button in park detail panel
4. On click, write to localStorage and re-render the park list + detail + progress counts
5. Existing hardcoded `visited: true` entries migrate to localStorage on first load

**Files:** index.html (new storage key, detail panel button, merge logic, progress counter)

### C2. Dynamic route targets (S2-9)

**Problem:** NEXT_TARGETS hardcoded to [22, 19, 14]; visited parks still shown with "Visited" pill.

**Implementation:**
1. Replace `const NEXT_TARGETS = [22, 19, 14]` with a computed function:
   ```js
   function getNextTargets(count = 3) {
     return PARKS.filter(p => !isVisited(p.id))
       .sort((a, b) => priorityScore(b) - priorityScore(a))
       .slice(0, count)
       .map(p => p.id);
   }
   ```
2. `isVisited()` checks both hardcoded `visited` flag and localStorage override
3. `priorityScore()` uses existing priority algorithm (tier + age + target bonuses minus visited penalty)
4. Route preview section re-renders from computed targets
5. When all parks visited, show completion state: "All 30 parks visited!"

**Files:** index.html (NEXT_TARGETS replacement, priorityScore, route render)

### C3. Clear imported venue on new game (S2-7)

**Problem:** Creating a new game after importing a park carries stale venue context.

**Implementation:**
1. In `createNewGame()`, do NOT copy `importedVenue` from previous game
2. In render, when switching to a new game, re-read the import payload fresh from localStorage
3. If import payload exists but user hasn't clicked "Use imported venue", show the import card with the option
4. If no import payload, import card shows default empty state

**Files:** scorekeeper.html (createNewGame, render import card logic)

---

## Batch D — Accessibility & Polish

**Findings addressed:**
- S3-12: Focus outline opacity may fail WCAG AA
- S3-13: No keyboard shortcuts
- S3-14: Tier colors hardcoded in JS, not theme tokens
- S3-15: Lineups optional but unclear

### D1. Focus outline contrast (S3-12)

**Problem:** `rgba(161,44,33,.32)` (32% opacity) on light backgrounds may not meet 3:1 contrast.

**Implementation:**
1. In both pages' `:focus-visible` rule, increase opacity: `rgba(161,44,33,.6)` or use solid `var(--accent)` at full opacity
2. Add `outline-offset: 3px` (already present) to prevent overlap
3. Test against all 5 theme backgrounds to ensure contrast passes

**Files:** index.html (focus-visible CSS), scorekeeper.html (focus-visible CSS)

### D2. Keyboard shortcuts (S3-13)

**Problem:** No shortcuts for common actions.

**Implementation:**
1. In scorekeeper.html, add keydown listener:
   - `Ctrl+Z` / `Cmd+Z`: undo last play (existing undo handler)
   - `Escape`: close any open panel/overlay
2. In index.html, add keydown listener:
   - `/`: focus search input
   - `Escape`: clear active park selection
3. Add `<kbd>` hints to buttons: Undo shows `⌘Z`, Search shows `/`
4. No shortcut overlay needed (too few shortcuts to warrant a modal)

**Files:** scorekeeper.html (keydown handler), index.html (keydown handler)

### D3. Tier colors in theme tokens (S3-14)

**Problem:** S/A/B/C tier pill colors hardcoded in JS, may clash with alternate themes.

**Implementation:**
1. In `theme-tokens.css`, add per-theme tier colors:
   ```css
   [data-theme="phillies"] { --tier-s: #2d6a4f; --tier-a: #1a6fa0; --tier-b: #6b7280; --tier-c: #9ca3af; }
   ```
2. In index.html JS (line ~711-716), replace hardcoded tier colors with CSS variable reads:
   ```js
   const tierColor = getComputedStyle(document.documentElement).getPropertyValue(`--tier-${tier.toLowerCase()}`).trim();
   ```
3. Update all 5 theme palettes with appropriate tier colors

**Files:** theme-tokens.css (new variables per theme), index.html (tier color lookup)

### D4. Lineup guidance clarity (S3-15)

**Problem:** "Set both batting orders before first pitch" but no enforcement; auto-fill confusing.

**Implementation:**
1. In scorekeeper.html lineup section, change guidance text to: "Lineups are optional. Empty slots show as 'Away 1', 'Home 1', etc."
2. When user clicks first event button with empty lineups, show one-time toast: "Tip: Fill in lineups for better play-by-play readability"
3. Store `lineupTipShown` in localStorage to show only once
4. Remove the prescriptive "before first pitch" language

**Files:** scorekeeper.html (guidance text, first-event handler, localStorage flag)

---

## Batch Execution Prompts

### Batch A — Claude (state design, validation logic, undo patterns)

```text
MLB Ballparks Quest Batch A: Data Safety & Destructive Guards
Architecture: Two static HTML pages with inline CSS/JS. No framework, no build step.
Files: scorekeeper.html (~1580 lines), index.html (~1031 lines)

You are making 5 changes. Read the full scorekeeper.html before editing.

1. TOAST SYSTEM (both pages)
Add showToast(message, tone, duration, onAction) to both pages.
Tones: 'info', 'success', 'error', 'undo'. Undo tone adds an action button.
CSS: position fixed, bottom 1.5rem, left 50%, translateX(-50%), z-index 300.
Animation: fade in 200ms, auto-dismiss, fade out 200ms.
Add to both pages' <style> and <script> sections.

2. RESET CONFIRMATION (scorekeeper.html, line ~1544)
Save pre-reset game object. After reset, show undo toast for 5 seconds.
If user clicks Undo, restore the saved game and re-render.
If toast expires, game stays reset.

3. GAME DELETE UNDO (scorekeeper.html, game list delete handler)
Before removing game from library, save the removed object.
Show undo toast: "Game removed" with Undo button.
On undo: push game back, syncLibrary(), render().

4. IMPORT SCHEMA VALIDATION (scorekeeper.html, import handler ~1533)
Before replayGame(parsed), validate: plays is array, state is object,
awayName and homeName are strings. On failure, showToast(reason, 'error').
On success, proceed and showToast('Game imported', 'success').

5. STORAGE FAILURE FEEDBACK (both pages)
In every try/catch around localStorage.setItem, on error:
showToast('Save failed — storage may be full', 'error', 8000).

Use existing escapeHtml() for any dynamic content in toasts.
Match existing CSS conventions (use var(--accent), var(--ink), etc).
```

### Batch B — Codex (template changes, auto-scroll, input field addition)

```text
MLB Ballparks Quest Batch B: Feedback & Empty States
Files: index.html, scorekeeper.html

3 changes. All are HTML/JS template additions with clear specs.

1. HIGHLIGHTS EMPTY STATE (index.html, ~line 874-889)
When visited.length === 0, render inside highlights section:
  <div class="section-card">
    <div class="section-kicker">Highlights</div>
    <h3>No parks visited yet</h3>
    <p>Score your first game to start building your ballpark collection.</p>
  </div>
Use existing section-card class.

2. PLAY LOG AUTO-SCROLL (scorekeeper.html, render function)
After play log HTML is written to DOM, if plays.length increased since last render:
  document.getElementById('playLog').scrollTo({ top: 0, behavior: 'smooth' });
Track previous plays.length in a module-level variable.

3. GAME TITLE FIELD (scorekeeper.html)
Add to setup section after venue input:
  <label>Game title <span style="opacity:.5">(optional)</span>
    <input id="gameTitle" placeholder="e.g. Opening Day 2026">
  </label>
In createNewGame(): add title: ''
In getGameLabel(): return game.title || `${game.awayName} at ${game.homeName}`
Bind input change to state.game.title = e.target.value; saveGame();
On render, populate from state.game.title.

Match existing input styling. No new CSS classes needed.
```

### Batch C — Claude (localStorage design, computed state, merge logic)

```text
MLB Ballparks Quest Batch C: Tracker Interactivity
File: index.html (~1031 lines)

3 changes requiring design judgment about state management.

1. MARK AS VISITED (index.html)
Add localStorage key: mlb_visited_parks_v1
Shape: { [parkId]: { visitDate: 'YYYY-MM-DD', rating: number|null } }
On load, merge localStorage visited data with hardcoded PARKS array.
isVisited(parkId) checks both sources.
Add "Mark as Visited" toggle in park detail panel.
On click: write to localStorage, re-render park list + detail + progress.
Migrate hardcoded visited:true entries to localStorage on first load.

Edge cases:
- User clears localStorage → falls back to hardcoded visited state
- Park has hardcoded visited:true AND localStorage entry → localStorage wins
- Rating from localStorage overrides hardcoded rating

2. DYNAMIC ROUTE TARGETS (index.html)
Replace const NEXT_TARGETS = [22, 19, 14] with:
  function getNextTargets(count=3) — filter unvisited, sort by priority, slice
Priority: existing priorityScore() algorithm
When all parks visited: show "All 30 parks visited!" card instead of route.
Re-render route section on park visited toggle.

3. CLEAR IMPORTED VENUE ON NEW GAME (scorekeeper.html)
In createNewGame(), do NOT copy importedVenue from previous game.
Re-read import payload from localStorage when switching games.
Import card shows fresh state per game, not carried over.

Do not change the tracker → scorekeeper handoff mechanism.
```

### Batch D — Codex (CSS fixes, ARIA, static content, theme variables)

```text
MLB Ballparks Quest Batch D: Accessibility & Polish
Files: index.html, scorekeeper.html, theme-tokens.css

4 changes. All are targeted CSS/HTML fixes.

1. FOCUS OUTLINE CONTRAST (both pages)
Change :focus-visible outline from rgba(161,44,33,.32) to rgba(161,44,33,.6).
Test visually against all 5 theme backgrounds.

2. KEYBOARD SHORTCUTS (both pages)
scorekeeper.html: add keydown listener:
  Ctrl/Cmd+Z → trigger existing undo handler
  Escape → clear any active state
index.html: add keydown listener:
  / → focus #searchInput
  Escape → clear activeParkId, re-render

3. TIER COLORS IN THEME TOKENS (theme-tokens.css, index.html)
Add to each theme in theme-tokens.css:
  --tier-s: #2d6a4f; --tier-a: #1a6fa0; --tier-b: #6b7280; --tier-c: #9ca3af;
(Adjust per theme palette.)
In index.html JS tier color lookup (~line 711-716), replace hardcoded colors with:
  getComputedStyle(document.documentElement).getPropertyValue('--tier-' + tier.toLowerCase()).trim()

4. LINEUP GUIDANCE (scorekeeper.html)
Change guidance text from "Set both batting orders before first pitch" to:
  "Lineups are optional. Empty slots appear as numbered placeholders."
On first event button click, if lineups are default/empty, show one-time toast:
  "Tip: Fill in lineups for better play-by-play detail"
Store lineupTipShown in localStorage. Show only once.

Match existing CSS variables and HTML patterns.
```

---

## Finding → Batch Traceability

| Finding | Severity | Batch | Task |
|---------|----------|-------|------|
| S1-1 Reset no confirmation | Critical | A | A2 |
| S1-2 No toast system | Critical | A | A1 |
| S1-3 Import no schema validation | Critical | A | A4 |
| S1-4 Storage failures console-only | Critical | A | A5 |
| S2-5 No "Mark as Visited" in tracker | High | C | C1 |
| S2-6 Highlights no empty state | High | B | B1 |
| S2-7 Imported venue persists | High | C | C3 |
| S2-8 Play log no auto-scroll | High | B | B2 |
| S2-9 Route shows visited targets | High | C | C2 |
| S2-10 Game delete no confirmation | High | A | A3 |
| S3-11 No game title field | Medium | B | B3 |
| S3-12 Focus outline contrast | Medium | D | D1 |
| S3-13 No keyboard shortcuts | Medium | D | D2 |
| S3-14 Tier colors hardcoded | Medium | D | D3 |
| S3-15 Lineup guidance unclear | Medium | D | D4 |

**All 15 findings addressed. Zero skipped.**

---

## Execution Order

1. **Batch A** (Claude) — toast system first (other batches use it), then safety guards
2. **Batch B** (Codex) — depends on A1 (toast exists), can start once toast is in
3. **Batch C** (Claude) — tracker interactivity, independent of scorekeeper batches
4. **Batch D** (Codex) — polish, no dependencies, can run last or parallel with C
