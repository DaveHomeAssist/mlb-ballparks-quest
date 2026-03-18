# MLB Ballparks Quest — Implementation Contracts

> **Produced:** 2026-03-18
> **Source:** UX_AUDIT_2026-03-18.md + IMPLEMENTATION_PLAN_2026-03-18.md
> **Constraint:** Static hosting, local-first, no dependencies, localStorage only

---

## Contract 1: Tracker Visited State Persistence

### localStorage Key

```
mlb_visited_parks_v1
```

### Data Model

```json
{
  "version": 1,
  "parks": {
    "3": { "visitDate": "2023-07-15", "rating": 5, "notes": "Iconic retro classic.", "bestFeature": "B and O Warehouse backdrop", "markedAt": "2026-03-18T14:30:00Z" },
    "4": { "visitDate": "2022-08-20", "rating": 5, "notes": "Green Monster in person.", "bestFeature": "Green Monster", "markedAt": "2026-03-18T14:30:00Z" }
  }
}
```

**Field rules:**
- `visitDate`: ISO date string YYYY-MM-DD. Required on mark-as-visited.
- `rating`: integer 1–5 or `null`. Optional.
- `notes`: string, max 500 chars. Optional.
- `bestFeature`: string, max 120 chars. Optional.
- `markedAt`: ISO datetime. Auto-set on write. Used for "recently visited" sorting.

### State Transitions

```
PAGE LOAD
  ├── localStorage key exists and parses → merge with PARKS array
  ├── localStorage key exists but corrupt → log warning, fall back to hardcoded PARKS
  └── localStorage key missing → seed from hardcoded PARKS visited:true entries, write key

MARK AS VISITED (from detail panel)
  ├── Park not visited → prompt for visitDate (default today), write to localStorage, re-render
  └── Park already visited → toggle to unvisited, remove from localStorage parks map, re-render

EDIT VISIT (from detail panel)
  └── Park visited → update rating/notes/bestFeature in localStorage, re-render detail

RE-RENDER triggers:
  - Park list (card visited badge, filter results)
  - Detail panel (toggle button label, visit metadata)
  - Progress board (visited/remaining counts, progress bars)
  - Highlights section (top 4 visited by markedAt desc)
  - Route preview (exclude visited from targets)
```

### Merge Logic

```js
function isVisited(parkId) {
  const ls = getVisitedStore();
  if (ls.parks[String(parkId)]) return true;
  const hardcoded = PARKS.find(p => p.id === parkId);
  return hardcoded && hardcoded.visited === true;
}

function getVisitData(parkId) {
  const ls = getVisitedStore();
  const override = ls.parks[String(parkId)];
  if (override) return override;
  const hardcoded = PARKS.find(p => p.id === parkId);
  if (hardcoded && hardcoded.visited) {
    return { visitDate: hardcoded.visitDate, rating: hardcoded.rating, notes: hardcoded.notes, bestFeature: hardcoded.bestFeature, markedAt: null };
  }
  return null;
}
```

**Precedence:** localStorage entry wins over hardcoded. If localStorage is cleared, hardcoded visited:true entries still show as visited.

### Edge Cases

1. **User clears localStorage:** Falls back to hardcoded state. Hardcoded visited parks still show. Dynamic-visited parks lost.
2. **Same park has hardcoded visited:true AND localStorage entry:** localStorage wins for all fields.
3. **User marks a hardcoded-visited park as unvisited:** Write `{ removed: true }` to localStorage for that parkId. `isVisited()` checks removed flag.
4. **localStorage quota exceeded on write:** Show toast "Could not save visit — storage may be full." Do not change UI state.
5. **Concurrent tabs:** No cross-tab sync. Each tab reads on load. Last write wins.

### UI Copy

| State | Copy |
|-------|------|
| Detail panel, not visited | Button: "Mark as Visited" |
| Detail panel, visited | Button: "Mark as Unvisited" · Below: "Visited [date] · Rating: [stars]" |
| Mark success toast | "✓ [Stadium] marked as visited" |
| Unmark success toast | "[Stadium] removed from visited" |
| Storage failure toast | "Could not save visit — storage may be full" |
| Visit date prompt | Label: "When did you visit?" Input: date picker, default today |

### Acceptance Criteria

- [ ] Marking a park as visited persists across page reload
- [ ] Progress board counts update immediately on toggle
- [ ] Highlights section shows the 4 most recently visited parks
- [ ] Filter "Visited" / "Not visited" respects dynamic state
- [ ] Route preview excludes newly visited parks
- [ ] Hardcoded visited parks show correctly when localStorage is empty
- [ ] Storage failure shows toast, does not corrupt UI state

### File Target

**index.html** — JS section (~line 677-1031)

---

## Contract 2: Dynamic Route Target Computation

### Data Model

No new localStorage key. Computed at render time from visited state (Contract 1).

### Computation

```js
function getNextTargets(count = 3) {
  const visited = getVisitedStore();
  return PARKS
    .filter(p => !isVisited(p.id))
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, count)
    .map(p => p.id);
}

function priorityScore(park) {
  let score = 0;
  if (park.tier === 'S') score += 30;
  else if (park.tier === 'A') score += 20;
  else if (park.tier === 'B') score += 10;
  const age = new Date().getFullYear() - (park.opened || 2000);
  score += Math.min(age * 0.05, 5);
  return score;
}
```

**Removes the hardcoded `const NEXT_TARGETS = [22, 19, 14]`.**

### State Transitions

```
RENDER ROUTE PREVIEW
  ├── getNextTargets() returns 3+ parks → render top 3 as route cards
  ├── getNextTargets() returns 1-2 parks → render available, fill empty slots with "Pick your next target"
  └── getNextTargets() returns 0 (all visited) → render completion card

PARK MARKED AS VISITED
  └── Re-call getNextTargets() → re-render route section
```

### Edge Cases

1. **All 30 parks visited:** Route section shows completion card. No "next" parks.
2. **No parks have tiers:** Score falls back to age-only priority. Still produces ranked list.
3. **User unmarks a park:** Park re-enters the unvisited pool and may appear in next targets.

### UI Copy

| State | Copy |
|-------|------|
| Completion card title | "All 30 parks visited" |
| Completion card body | "You've been to every active MLB ballpark. Time for a victory lap." |
| Route card for unvisited park | Existing card format with tier pill, city, stadium |

### Acceptance Criteria

- [ ] Route preview excludes all visited parks (hardcoded + dynamic)
- [ ] S/A tier parks appear before untiered parks
- [ ] Visiting a park immediately removes it from route preview
- [ ] Completion card renders when all 30 visited
- [ ] Unvisiting a park puts it back in the route pool

### File Target

**index.html** — replace `NEXT_TARGETS` constant and route render block

---

## Contract 3: Scorekeeper → Tracker Return Handoff

### localStorage Key

```
mlb_scorekeeper_return_v1
```

### Data Model

```json
{
  "version": 1,
  "exportedAt": "2026-03-18T16:00:00Z",
  "gameId": "game-lx5a3k-r2m7q4",
  "parkId": 22,
  "result": {
    "awayName": "Pirates",
    "homeName": "Phillies",
    "awayRuns": 3,
    "homeRuns": 7,
    "innings": 9,
    "status": "final"
  }
}
```

**Written by:** scorekeeper.html on game finalize
**Read by:** index.html on page load
**Consumed once:** tracker reads, processes, and clears the key

### State Transitions

```
SCOREKEEPER: FINALIZE GAME
  ├── Game has importedVenue with parkId → write return payload to localStorage
  └── Game has no importedVenue → do not write return payload (no park to link)

TRACKER: PAGE LOAD
  ├── Return key exists → read payload
  │   ├── parkId matches a PARKS entry
  │   │   ├── Park not visited → auto-prompt: "You scored a game at [Stadium]. Mark as visited?"
  │   │   └── Park already visited → show toast: "Game scored at [Stadium]" (info only)
  │   └── parkId not found → ignore, clear key
  └── Return key missing → normal load

USER RESPONDS TO PROMPT
  ├── "Mark as Visited" → write to visited store (Contract 1), clear return key, re-render
  ├── "Not now" → clear return key, continue
  └── User ignores banner → banner auto-dismisses after 10s, return key stays for next load
```

### Edge Cases

1. **User finalizes game but never imported a venue:** No return payload written. Nothing happens on tracker.
2. **User opens tracker before finalizing:** No return key exists. Normal load.
3. **Return key has stale gameId:** Accepted. Only parkId matters for the visited prompt.
4. **Corrupt return key:** Try/catch on JSON.parse, fallback to ignoring.
5. **Multiple games finalized between tracker visits:** Last write wins. Only most recent game prompts.

### UI Copy

| State | Copy |
|-------|------|
| Return prompt banner | "You scored a game at [Stadium]. Mark as visited?" · Buttons: "Mark Visited" / "Not now" |
| Already-visited toast | "Game logged at [Stadium] ✓" |
| Mark success (from return) | "✓ [Stadium] added to your visited parks" |

### Acceptance Criteria

- [ ] Finalizing a game with imported venue writes return payload
- [ ] Tracker reads return payload on next load
- [ ] Prompt offers to mark park as visited
- [ ] Accepting the prompt writes to visited store and clears return key
- [ ] Dismissing clears the banner but preserves return key for next load
- [ ] No prompt appears when no return key exists
- [ ] No prompt appears when game had no imported venue

### File Targets

**scorekeeper.html** — finalize handler
**index.html** — page load, return banner

---

## Contract 4: Save Status State Model

### localStorage Key

No new key. Status stored as a transient UI variable.

### State Machine

```
IDLE → SAVING → SAVED → IDLE
       │
       └→ FAILED → IDLE (after toast dismisses)
```

### States

| State | Trigger | UI | Duration |
|-------|---------|-----|----------|
| `idle` | Default, or 2s after `saved` | No indicator | Permanent |
| `saving` | `saveGame()` called | Faint pulse on toolbar area | Until localStorage write completes |
| `saved` | `saveGame()` succeeds | "Saved ✓" chip in toolbar, green tint | 2 seconds, then → idle |
| `failed` | `saveGame()` throws | Toast: "Save failed — storage may be full" | 8 seconds (toast) |

### Implementation

```js
let _saveStatus = 'idle'; // 'idle' | 'saving' | 'saved' | 'failed'
let _saveStatusTimer = null;

function setSaveStatus(status) {
  _saveStatus = status;
  clearTimeout(_saveStatusTimer);
  renderSaveChip();
  if (status === 'saved') {
    _saveStatusTimer = setTimeout(() => setSaveStatus('idle'), 2000);
  }
}

function saveGame() {
  if (!state.game || !state.library) return;
  setSaveStatus('saving');
  try {
    syncLibrary();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.library));
    setSaveStatus('saved');
  } catch (err) {
    console.warn('Save failed:', err);
    setSaveStatus('failed');
    showToast('Save failed — storage may be full. Export your data.', 'error', 8000);
  }
}
```

### UI Rendering

```js
function renderSaveChip() {
  const chip = document.getElementById('saveStatusChip');
  if (!chip) return;
  if (_saveStatus === 'saved') { chip.textContent = 'Saved ✓'; chip.className = 'status-chip is-success'; }
  else if (_saveStatus === 'failed') { chip.textContent = 'Save failed'; chip.className = 'status-chip is-error'; }
  else { chip.textContent = ''; chip.className = 'status-chip'; }
}
```

### Edge Cases

1. **Rapid saves:** Each save resets the 2s timer. Only the last "Saved ✓" persists.
2. **Save fails then succeeds:** Status flips to `saved` on success. Toast from failure may still be visible.
3. **Tab hidden during save:** Status updates. Toast may not be visible if browser throttles rendering.

### Acceptance Criteria

- [ ] "Saved ✓" chip appears after every successful save
- [ ] Chip auto-clears after 2 seconds
- [ ] Failed save shows error toast with 8s duration
- [ ] Rapid saves don't leave stale chips

### File Target

**scorekeeper.html** — saveGame function, new renderSaveChip, HTML chip element in toolbar

---

## Contract 5: Import Schema Validation

### Validation Function

```js
function validateGameImport(obj) {
  const errors = [];

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, errors: ['File is not a valid game object'] };
  }

  if (typeof obj.awayName !== 'string' || !obj.awayName.trim()) {
    errors.push('Missing or empty away team name');
  }
  if (typeof obj.homeName !== 'string' || !obj.homeName.trim()) {
    errors.push('Missing or empty home team name');
  }
  if (!Array.isArray(obj.plays)) {
    errors.push('Missing plays array');
  } else {
    obj.plays.forEach((play, i) => {
      if (!play || typeof play !== 'object') {
        errors.push(`Play ${i + 1}: not a valid object`);
      } else if (!EVENTS[play.event]) {
        errors.push(`Play ${i + 1}: unknown event "${play.event}"`);
      }
    });
  }
  if (!obj.state || typeof obj.state !== 'object') {
    errors.push('Missing game state object');
  } else {
    if (typeof obj.state.inning !== 'number') errors.push('state.inning is not a number');
    if (!['top', 'bottom'].includes(obj.state.half)) errors.push('state.half must be "top" or "bottom"');
  }
  if (obj.lineups) {
    if (!obj.lineups.away || !Array.isArray(obj.lineups.away)) errors.push('lineups.away is not an array');
    if (!obj.lineups.home || !Array.isArray(obj.lineups.home)) errors.push('lineups.home is not an array');
  }

  return { ok: errors.length === 0, errors };
}
```

### Integration Point

```js
// In import handler (~line 1533)
try {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const validation = validateGameImport(parsed);
  if (!validation.ok) {
    showToast('Import failed: ' + validation.errors[0], 'error', 6000);
    return;
  }
  state.game = replayGame(parsed);
  saveGame();
  render();
  showToast('Game imported', 'success');
} catch (error) {
  showToast('Import failed: file is not valid JSON', 'error', 5000);
}
```

### Edge Cases

1. **Valid JSON, wrong shape (e.g. `{"wrong": true}`):** Caught by awayName/homeName/plays checks.
2. **Plays array has unknown event keys:** Each flagged individually. Import blocked.
3. **Missing state object:** Import blocked. Error explains what's missing.
4. **File is not JSON at all:** Caught by JSON.parse catch block.
5. **Empty file:** JSON.parse returns null → caught by "not a valid game object" check.
6. **Game exported from older version:** If basic shape matches, replayGame normalizes. Validation is structural, not version-aware.

### UI Copy

| State | Copy |
|-------|------|
| Success toast | "Game imported" (success tone) |
| Structural failure | "Import failed: [first error]" (error tone) |
| JSON parse failure | "Import failed: file is not valid JSON" (error tone) |
| Multiple errors | Toast shows first error only. Console logs full array. |

### Acceptance Criteria

- [ ] Valid game JSON imports successfully with success toast
- [ ] Invalid JSON shows parse error toast
- [ ] Valid JSON with wrong shape shows structural error toast
- [ ] Unknown event keys in plays array are caught
- [ ] Missing required fields each produce a specific error message
- [ ] Import does not proceed if validation fails

### File Target

**scorekeeper.html** — new `validateGameImport()` function, import handler modification

---

## Contract 6: Keyboard Shortcut Map

### Scorekeeper Shortcuts

| Key | Action | Guard | Implementation |
|-----|--------|-------|----------------|
| `Ctrl/Cmd + Z` | Undo last play | `state.game.plays.length > 0` | Call existing undo handler |
| `Escape` | Dismiss active toast or cancel edit mode | Always | `clearToast()` or `cancelEdit()` |

### Tracker Shortcuts

| Key | Action | Guard | Implementation |
|-----|--------|-------|----------------|
| `/` | Focus search input | Not in input/textarea | `document.getElementById('searchInput').focus()` |
| `Escape` | Clear active park selection | `state.activeParkId !== null` | `state.activeParkId = null; render()` |

### Handler Pattern

```js
document.addEventListener('keydown', function(e) {
  const mod = e.metaKey || e.ctrlKey;
  const inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

  // Mod shortcuts work regardless of focus
  if (mod && e.key === 'z') { e.preventDefault(); handleUndo(); return; }

  // Non-mod shortcuts only when not in a field
  if (inField) return;
  if (e.key === '/') { e.preventDefault(); document.getElementById('searchInput').focus(); return; }
  if (e.key === 'Escape') { clearActivePark(); return; }
});
```

### Visual Hints

Add `<kbd>` elements to relevant buttons:
- Undo button: `↩ Undo <kbd>⌘Z</kbd>`
- Search input placeholder: `"Team, stadium, or city (/)"` (append hint to placeholder)

### Edge Cases

1. **User is typing in lineup input and presses Escape:** Should NOT clear park — guard on `inField` prevents it.
2. **User presses Ctrl+Z with empty plays:** Guard prevents action. No toast.
3. **Multiple toasts visible and user presses Escape:** Dismiss the most recent toast only.

### Acceptance Criteria

- [ ] Ctrl/Cmd+Z undoes last play in scorekeeper
- [ ] `/` focuses search in tracker when not in a field
- [ ] Escape clears active park in tracker
- [ ] Escape dismisses active toast in scorekeeper
- [ ] Shortcuts don't fire when typing in inputs
- [ ] `<kbd>` hints visible on Undo button and search placeholder

### File Targets

**scorekeeper.html** — keydown listener in `<script>` section
**index.html** — keydown listener in `<script>` section

---

## Contract 7: Game Library Search and Sort

### Data Model

No new localStorage key. Sort/search state is transient (lives in a `libraryState` object).

```js
const libraryState = {
  search: '',
  sort: 'recent'  // 'recent' | 'oldest' | 'alphabetical' | 'status'
};
```

### Search Behavior

```js
function filterGames(games, query) {
  if (!query.trim()) return games;
  const q = query.toLowerCase().trim();
  return games.filter(g =>
    (g.title || '').toLowerCase().includes(q) ||
    (g.awayName || '').toLowerCase().includes(q) ||
    (g.homeName || '').toLowerCase().includes(q) ||
    (g.venueName || '').toLowerCase().includes(q) ||
    getGameLabel(g).toLowerCase().includes(q)
  );
}
```

**Fields searched:** title, awayName, homeName, venueName, computed label.
**Behavior:** Case-insensitive substring match. No regex. Instant filtering on input.

### Sort Behavior

```js
function sortGames(games, sortKey) {
  const sorted = [...games];
  switch (sortKey) {
    case 'recent': return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'oldest': return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'alphabetical': return sorted.sort((a, b) => getGameLabel(a).localeCompare(getGameLabel(b)));
    case 'status': return sorted.sort((a, b) => {
      if (a.status === 'in progress' && b.status !== 'in progress') return -1;
      if (b.status === 'in progress' && a.status !== 'in progress') return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    default: return sorted;
  }
}
```

### UI Elements

```html
<div class="library-controls">
  <input id="gameSearch" type="search" placeholder="Search games…" />
  <select id="gameSort">
    <option value="recent">Recent first</option>
    <option value="oldest">Oldest first</option>
    <option value="alphabetical">A → Z</option>
    <option value="status">In progress first</option>
  </select>
</div>
```

**Position:** Above `#gamesList` in the games library section.

### State Transitions

```
USER TYPES IN SEARCH
  └── On input (debounced 150ms) → filter + sort → re-render game list

USER CHANGES SORT
  └── On change → re-render game list with new sort

GAME CREATED / DELETED / SWITCHED
  └── Re-render game list with current search + sort applied
```

### Edge Cases

1. **Search matches zero games:** Show empty state: "No games match '[query]'" with clear button.
2. **Active game is filtered out:** Active game stays active and playable. It just disappears from the list. Clearing search shows it again.
3. **One game in library:** Search and sort still functional. Controls always visible.
4. **Game title is empty:** Falls back to computed `getGameLabel()` for search matching.

### UI Copy

| State | Copy |
|-------|------|
| No search results | "No games match '[query]'" · Button: "Clear search" |
| Search placeholder | "Search games…" |
| Results count | "[N] game[s]" below controls |

### Acceptance Criteria

- [ ] Search filters games by title, team names, and venue
- [ ] Sort reorders by recent, oldest, alphabetical, or status
- [ ] Active game stays playable even when filtered out of the list
- [ ] Empty search results show helpful message with clear action
- [ ] Controls render above the game list
- [ ] Creating or deleting a game re-renders with current filters applied

### File Target

**scorekeeper.html** — HTML above `#gamesList`, new JS functions, modify `renderGamesList()`

---

## Codex Execution Specs

### Spec 1 — Visited State + Dynamic Route (Claude → index.html)

```text
File: index.html (~1031 lines, inline CSS/JS)

PREREQUISITES: Read Contract 1 and Contract 2 above.

CHANGES:
1. Add getVisitedStore(), setVisitedStore(), isVisited(), getVisitData() functions
2. On page load, seed localStorage from hardcoded PARKS if key missing
3. Replace const NEXT_TARGETS = [22, 19, 14] with getNextTargets(3) function
4. Add "Mark as Visited" / "Mark as Unvisited" button to detail panel render
5. On toggle: write to localStorage, re-render park list + detail + progress + highlights + route
6. Completion card when all 30 visited
7. Show toast on mark/unmark success and storage failure

Use escapeHtml() for all dynamic content. Match existing card/button CSS classes.
```

### Spec 2 — Return Handoff (Claude → both files)

```text
Files: scorekeeper.html, index.html

PREREQUISITES: Read Contract 3 above. Depends on Contract 1 (visited store).

SCOREKEEPER CHANGES:
1. In finalize handler, if game.importedVenue has parkId, write mlb_scorekeeper_return_v1

INDEX CHANGES:
1. On page load, check for return key
2. If parkId valid and park not visited: show banner with "Mark as Visited" / "Not now"
3. If park already visited: show info toast
4. Clear return key after user responds or on "Not now"
```

### Spec 3 — Toast + Save Status + Validation (Claude → scorekeeper.html)

```text
File: scorekeeper.html (~1580 lines, inline CSS/JS)

PREREQUISITES: Read Contracts 4 and 5 above.

CHANGES:
1. Add showToast(message, tone, duration, onAction) function + CSS
2. Add validateGameImport(obj) function per Contract 5
3. Wire validation into import handler before replayGame()
4. Add save status state machine per Contract 4
5. Add saveStatusChip to toolbar HTML
6. Wire reset handler with undo toast per Contract A2
7. Wire game delete handler with undo toast per Contract A3
8. Wire all localStorage.setItem try/catch with error toasts
```

### Spec 4 — Keyboard Shortcuts (Codex → both files)

```text
Files: scorekeeper.html, index.html

PREREQUISITES: Read Contract 6.

CHANGES:
1. scorekeeper: keydown listener for Ctrl/Cmd+Z (undo) and Escape (dismiss toast/cancel)
2. index: keydown listener for / (focus search) and Escape (clear active park)
3. Guard: skip non-mod shortcuts when in input/textarea/select
4. Add <kbd> hints: Undo button gets "⌘Z", search placeholder gets " (/)"
```

### Spec 5 — Game Library Search + Sort (Codex → scorekeeper.html)

```text
File: scorekeeper.html

PREREQUISITES: Read Contract 7.

CHANGES:
1. Add #gameSearch input and #gameSort select above #gamesList in HTML
2. Add filterGames() and sortGames() functions per Contract 7
3. In renderGamesList(), apply filter + sort before building HTML
4. Bind input/change events to re-render
5. Show results count and empty state per Contract 7 UI copy
6. Style controls to match existing panel-head pattern
```

---

## Contract 8: Toast and Recovery System

### Goal

Give both pages a small feedback layer for success, error, and undo actions without adding dependencies.

### Runtime Model

```js
let activeToast = null;
let activeToastTimer = null;

function clearToast() {
  if (activeToastTimer) clearTimeout(activeToastTimer);
  activeToastTimer = null;
  if (!activeToast) return;
  activeToast.remove();
  activeToast = null;
}

function showToast(message, tone = 'info', duration = 3200, actionLabel = '', onAction = null) {
  clearToast();
  const toast = document.createElement('section');
  toast.className = `toast is-${tone}`;
  toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="toast-copy">${escapeHtml(message)}</div>
    <div class="toast-actions">
      ${actionLabel ? `<button class="toast-action" type="button">${escapeHtml(actionLabel)}</button>` : ''}
      <button class="toast-close" type="button" aria-label="Dismiss notification">Dismiss</button>
    </div>
  `;
  document.body.appendChild(toast);
  activeToast = toast;
  if (actionLabel && typeof onAction === 'function') {
    toast.querySelector('.toast-action').addEventListener('click', () => {
      onAction();
      clearToast();
    });
  }
  toast.querySelector('.toast-close').addEventListener('click', clearToast);
  if (duration > 0) {
    activeToastTimer = setTimeout(clearToast, duration);
  }
}
```

### Tones

| Tone | Use |
|------|-----|
| `info` | Neutral feedback like handoff ready |
| `success` | Import success, export success, saved state |
| `error` | Storage failure, invalid import, bad file |
| `undo` | Reset game, delete game |

### Recovery Actions

1. Reset game
   1. Snapshot current game
   2. Reset immediately
   3. Toast: `Game reset` with `Undo`

2. Delete game
   1. Snapshot removed game and original index
   2. Delete immediately
   3. Toast: `Game removed` with `Undo`

### Acceptance Criteria

- [ ] Only one toast is visible at a time
- [ ] Undo actions restore exact prior state
- [ ] Escape dismisses the current toast
- [ ] Error toast uses `role="alert"`

### File Targets

**index.html** — toast CSS and helper
**scorekeeper.html** — toast CSS and helper

---

## Contract 9: Highlights Empty State, Play Log Auto Scroll, and Game Title

### Highlights Empty State

When zero parks are visited:

```html
<article class="section-card">
  <div class="section-kicker">Highlights</div>
  <h3>No parks visited yet</h3>
  <p>Score your first game to start building your ballpark collection.</p>
</article>
```

**Acceptance**

- [ ] Highlights never renders as an empty gap

### Play Log Auto Scroll

Track last play count in module state:

```js
let lastRenderedPlayCount = 0;
```

After `renderPlayLog()`:

```js
if (state.game.plays.length > lastRenderedPlayCount) {
  els.playLog.scrollTo({ top: 0, behavior: 'smooth' });
}
lastRenderedPlayCount = state.game.plays.length;
```

**Guard**

Do not force scroll when a user just entered edit mode without adding a play.

### Game Title

Add optional title field in setup. Fallback label remains `Away at Home`.

```js
function getGameLabel(game) {
  return (game.title || '').trim() || `${game.awayName || 'Away'} at ${game.homeName || 'Home'}`;
}
```

**Acceptance**

- [ ] Library cards can show custom titles
- [ ] Exports use title when present
- [ ] Blank title falls back safely

### File Targets

**index.html** — highlights empty state
**scorekeeper.html** — play log auto scroll and game title

---

## Contract 10: Focus, Shortcut, Tier Token, and Lineup Guidance Rules

### Focus Contrast

Use stronger focus outline on both pages:

```css
:focus-visible{
  outline: 3px solid color-mix(in srgb, var(--accent) 72%, white 8%);
  outline-offset: 3px;
}
```

### Keyboard Rules

1. Ignore non mod shortcuts inside `input`, `textarea`, or `select`
2. Allow mod undo in scorekeeper
3. Tracker shortcuts
   1. `/` focuses search
   2. `Escape` clears selected park
4. Scorekeeper shortcuts
   1. `Cmd/Ctrl + Z` undo
   2. `Escape` dismiss toast or cancel play edit

### Tier Tokens

Move tier styling fully into CSS tokens and classes.

```css
.tier-pill[data-tier="S"]{ color: var(--tier-s-ink); background: var(--tier-s-bg); }
.tier-pill[data-tier="A"]{ color: var(--tier-a-ink); background: var(--tier-a-bg); }
.tier-pill[data-tier="B"]{ color: var(--tier-b-ink); background: var(--tier-b-bg); }
.tier-pill[data-tier="C"]{ color: var(--tier-c-ink); background: var(--tier-c-bg); }
```

No inline style attributes for tier colors.

### Lineup Guidance

Replace prescriptive copy with:

`Lineups are optional. Empty slots appear as numbered placeholders.`

One time tip:

1. On first scoring action with all lineup slots blank
2. Show toast: `Tip: Fill in lineups for better play by play detail`
3. Persist flag:

```text
mlb_scorekeeper_lineup_tip_v1
```

### Acceptance Criteria

- [ ] Focus ring is readable across all themes
- [ ] Tier pills adapt when theme changes
- [ ] Shortcuts do not fire while typing
- [ ] Lineup tip appears once only

### File Targets

**index.html** — focus and tracker shortcuts
**scorekeeper.html** — focus, shortcuts, lineup tip
**theme-tokens.css** — tier tokens
