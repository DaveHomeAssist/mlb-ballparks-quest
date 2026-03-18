# MLB Ballparks Quest — Validation Matrix

> **Scope:** 10 feature changes across index.html and scorekeeper.html
> **Architecture:** Static HTML, vanilla JS, localStorage persistence, no build step
> **Theme system:** theme-tokens.css + theme-switcher.js + theme-switcher-ui.js
> **Storage keys:** `app-theme`, `mlb_ballparks_scorekeeper_import_v1`, `mlb_ballparks_scorekeeper_state_v1`

---

## 1. Toast Feedback

Neither page currently surfaces visible feedback for save, import, or error events. All failures log to console only.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 1.1 | Trigger a successful save in scorekeeper | Toast appears with confirmation text, auto-dismisses within 3s | |
| 1.2 | Trigger a localStorage write failure (quota exceeded) | Toast appears with error message, does not auto-dismiss | |
| 1.3 | Import a valid game JSON in scorekeeper | Toast confirms import with game label | |
| 1.4 | Import invalid JSON in scorekeeper | Toast shows parse error, no game created | |
| 1.5 | Click scorekeeper link from tracker (writes import payload) | Toast on tracker confirms handoff written | |
| 1.6 | Two toasts fired in rapid succession | Second toast replaces first or stacks without overflow | |
| 1.7 | Toast with keyboard focus | Toast does not steal focus from active element | |
| 1.8 | Toast under reduced motion | No slide/fade animation, appears and disappears instantly | |

### Edge Cases

- localStorage disabled entirely (private browsing on some browsers): toast must still render even if the underlying write fails
- Toast text overflow: long error messages must truncate or wrap, not break layout
- Theme switch while toast is visible: toast colors must update to match new theme

### Failure Expectations

- Console errors remain as backup logging; toast is additive, not a replacement
- If toast DOM injection fails, app continues functioning silently

### Recovery

- Dismissing a toast clears it from DOM; no orphaned elements after timeout

---

## 2. Reset and Delete Recovery

No reset or delete flows exist on index.html. Scorekeeper has game reset (clears plays/state) but no delete or undo.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 2.1 | Reset active game in scorekeeper | Confirm dialog appears before reset executes | |
| 2.2 | Confirm reset | Plays cleared, score zeroed, state reset to inning 1 top, lineup preserved | |
| 2.3 | Cancel reset | No state change, game continues | |
| 2.4 | Reset then undo (if undo recovery added) | Previous game state restored from snapshot | |
| 2.5 | Delete a game from library | Confirm dialog, game removed from library list, localStorage updated | |
| 2.6 | Delete then undo (if recovery added) | Game restored to library within undo window | |
| 2.7 | Delete the only game in library | Library shows empty state after delete; new game CTA visible | |
| 2.8 | Delete active game | Library switches to next game or empty state; no orphan references | |
| 2.9 | Reset on a game with 0 plays | No-op or toast "Nothing to reset" | |

### Edge Cases

- Rapid double-click on reset button: must not fire twice or corrupt state
- Reset during edit mode (`editingPlayIndex` set): edit mode must clear before reset
- localStorage full when saving undo snapshot: reset still executes, undo unavailable with toast warning

### Failure Expectations

- If undo snapshot write fails, reset still completes; user warned that undo is unavailable
- Confirm dialog must block execution; no background state mutation

### Recovery

- Undo restores full game object including plays, lineups, state, notes, venue
- Undo window is single-level (last destructive action only) unless otherwise specified

---

## 3. Import Schema Validation

Scorekeeper file import currently does `JSON.parse()` in a try-catch with no field validation. Tracker import payload validation checks for `venue` and `exportedAt` keys plus 1-hour expiry.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 3.1 | Import well-formed game JSON | Game loads, plays replay, scores derived correctly | |
| 3.2 | Import JSON missing `plays` array | Validation error shown, import rejected | |
| 3.3 | Import JSON with `plays` but no `state` | Validation error or state rebuilt from plays | |
| 3.4 | Import JSON with unknown event codes in plays | Warning shown per unknown code; valid plays still imported | |
| 3.5 | Import non-JSON file (.csv, .txt, image) | Parse error caught, toast shown, no crash | |
| 3.6 | Import empty file (0 bytes) | Parse error caught, toast shown | |
| 3.7 | Import JSON array instead of object | Rejected with "Expected game object" message | |
| 3.8 | Import game with `version` field higher than current | Warning: "This file may be from a newer version" | |
| 3.9 | Import game with no `id` field | New ID generated, import proceeds | |
| 3.10 | Import game with duplicate ID of existing game | Prompt to overwrite or create copy | |
| 3.11 | Import scorekeeper payload with expired `exportedAt` (>1hr) | Payload removed from localStorage, no auto-apply | |
| 3.12 | Import scorekeeper payload with missing `venue` | Payload ignored, no error shown | |
| 3.13 | Import scorekeeper payload with future `exportedAt` | Treated as valid (clock skew tolerance) | |

### Edge Cases

- File >1MB: must not freeze UI; consider FileReader async behavior
- JSON with prototype pollution keys (`__proto__`, `constructor`): must not execute
- Malformed UTF-8: parse error handled gracefully
- Import while another game is active and unsaved: must not overwrite active game

### Failure Expectations

- All parse and validation errors caught in try-catch; no uncaught exceptions
- Failed import leaves library state unchanged
- Console logs the raw error for debugging

### Recovery

- After failed import, user can retry with a different file
- No partial state written to localStorage on validation failure

---

## 4. Visited Toggle and Dynamic Route Board

Visited state is currently hardcoded in the PARKS array. No toggle UI exists. Route board renders from hardcoded `NEXT_TARGETS = [22, 19, 14]`.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 4.1 | Toggle park from "Open" to "Visited" | Park card updates pill to "Visited", visited count increments, remaining decrements | |
| 4.2 | Toggle park from "Visited" back to "Open" | Counts revert, pill reverts | |
| 4.3 | Toggle visited on a park in the route board | Route board re-renders: visited park removed, next unvisited park fills the slot | |
| 4.4 | Mark all 30 parks visited | Route board shows empty state or completion message; progress shows 30/30 | |
| 4.5 | Filter to "Visited" then toggle a park to unvisited | Park disappears from filtered view | |
| 4.6 | Filter to "Not visited" then toggle a park to visited | Park disappears from filtered view | |
| 4.7 | Search for a park then toggle visited | Search results reflect new state without clearing search | |
| 4.8 | Reload page after toggling | Visited state persists from localStorage | |
| 4.9 | Toggle visited with localStorage disabled | Toggle still works in memory for session; warning toast on persistence failure | |
| 4.10 | Route board with 0 unvisited parks remaining | Board shows completion state, no empty cards | |

### Edge Cases

- Rapid toggle (click-click): must not double-fire or desync count
- Toggle during route board animation (if any): board must not render partial state
- Concurrent tabs: second tab may have stale visited state; no crash expected but sync not guaranteed

### Failure Expectations

- If localStorage write fails, in-memory state still reflects toggle; toast warns about persistence
- Route board never renders undefined parks or empty card shells

### Recovery

- Toggling back reverses the action completely (counts, filters, route board)
- Export/import should round-trip visited state

---

## 5. Game Title Field

Title is currently auto-generated as `{awayName} at {homeName}` via `getGameLabel()`. No editable title input exists.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 5.1 | Create new game with default team names | Title shows "Away at Home" in library | |
| 5.2 | Change away team name to "Phillies" | Title updates to "Phillies at Home" in library | |
| 5.3 | Change both team names | Title reflects both names | |
| 5.4 | Edit title field directly (if added) | Custom title persists, overrides auto-generated label | |
| 5.5 | Clear title field (if editable) | Falls back to auto-generated "{away} at {home}" | |
| 5.6 | Title with special characters (<, >, &, ") | Rendered safely, no XSS, no HTML injection | |
| 5.7 | Very long title (100+ chars) | Truncated in library list with ellipsis, full title in detail view | |
| 5.8 | Title in JSON export | `title` field present and matches displayed value | |
| 5.9 | Import game with custom title | Custom title preserved, not overwritten by auto-generation | |

### Edge Cases

- Team name changed after title was manually set: manual title must not revert to auto-generated
- Title containing only whitespace: treated as empty, falls back to auto-generated
- Emoji in title: rendered correctly across browsers

### Failure Expectations

- Empty string title never shown; always fall back to generated label
- Title is display-only metadata; never used as a key or identifier (ID is separate)

### Recovery

- Clearing a custom title restores auto-generation behavior

---

## 6. Keyboard Shortcuts

Current keyboard support: skip link, focus-visible outlines, theme switcher Escape-to-close. No app-level shortcuts exist.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 6.1 | Tab through all interactive elements on index.html | Focus order matches visual order; no trapped elements | |
| 6.2 | Tab through all interactive elements on scorekeeper.html | Focus order matches visual order; all buttons, inputs, selects reachable | |
| 6.3 | Escape key on theme switcher panel | Panel closes, focus returns to trigger button | |
| 6.4 | Escape key on open modal/dialog (if any) | Dialog closes, focus returns to trigger | |
| 6.5 | Enter/Space on event buttons (scorekeeper) | Play logged, same as click | |
| 6.6 | Enter/Space on park card (tracker) | Card expands/selects, same as click | |
| 6.7 | Arrow keys in lineup inputs (scorekeeper) | Tab or arrow moves between lineup slots | |
| 6.8 | Shortcut key for undo in scorekeeper (Ctrl+Z / Cmd+Z) | Last play undone if undo is supported | |
| 6.9 | Shortcut key while text input is focused | Shortcut suppressed; typing not intercepted | |
| 6.10 | Shortcut overlay/help (? key) | If implemented, shows shortcut reference; dismisses with Escape | |
| 6.11 | All shortcuts under screen reader (VoiceOver) | No conflicts with screen reader key bindings | |

### Edge Cases

- Focus on non-interactive element then press shortcut: must not throw
- Modifier keys (Shift+Tab): reverse tab order works correctly
- Browser default shortcuts (Ctrl+S, Ctrl+P): not intercepted by app

### Failure Expectations

- Unhandled keypress is a no-op; never throws or mutates state
- If shortcut handler fails, event propagation continues normally

### Recovery

- No recovery needed; keyboard actions are either idempotent or undoable

---

## 7. Save Status Chip

Both pages save silently with no visible indicator. Scorekeeper auto-saves on every action via `saveGame()`.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 7.1 | Edit team name in scorekeeper | Chip shows "Saving..." then "Saved" within 500ms | |
| 7.2 | Log a play event | Chip shows "Saved" after play recorded | |
| 7.3 | Edit lineup name | Chip shows "Saved" after input blur or debounce | |
| 7.4 | Edit notes textarea | Chip shows "Saved" after debounce (not on every keystroke) | |
| 7.5 | Save fails (localStorage quota) | Chip shows "Save failed" in error color, does not auto-dismiss | |
| 7.6 | Save fails then succeeds on retry | Chip transitions from "Save failed" to "Saved" | |
| 7.7 | Rapid saves (10 actions in 2 seconds) | Chip does not flicker; shows final "Saved" state | |
| 7.8 | Chip visible across all themes | Text and background contrast meet WCAG AA in all 5 themes | |
| 7.9 | Chip under reduced motion | No transition animation; state change is immediate | |
| 7.10 | Chip on mobile viewport (≤720px) | Chip visible, does not overlap controls or overflow | |

### Edge Cases

- Page load with no prior state: chip shows nothing (not "Saved") until first user action
- Switch games in library: chip resets; does not show stale "Saved" from previous game
- Save triggered by import: chip shows "Saved" after import replay completes

### Failure Expectations

- Chip is informational only; save failure does not block user from continuing to use the app
- "Save failed" chip stays visible until next successful save or manual dismiss

### Recovery

- After storage quota error, user can export JSON to preserve data, then clear old games

---

## 8. Focus Contrast

Global `:focus-visible` uses `rgba(161,44,33,.32)` (translucent Phillies red). Theme switcher uses `color-mix(in srgb, var(--accent) 28%, transparent)`.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 8.1 | Tab to any button on index.html | Focus ring visible with ≥3:1 contrast against background | |
| 8.2 | Tab to any button on scorekeeper.html | Focus ring visible with ≥3:1 contrast against background | |
| 8.3 | Focus on park card (index.html) | Card focus ring visible against cream background | |
| 8.4 | Focus on event button (scorekeeper) | Ring visible against button background color | |
| 8.5 | Focus on HR button (special gold style) | Ring visible against gold/accent background | |
| 8.6 | Focus on out-type button (muted style) | Ring visible against muted background | |
| 8.7 | Switch to Eagles theme (dark teal accent) | Focus ring color adapts to theme accent | |
| 8.8 | Switch to Flyers theme (orange accent) | Focus ring visible, not lost against orange elements | |
| 8.9 | Focus ring on white background element | Ring contrast ≥3:1 per WCAG 2.1 SC 1.4.11 | |
| 8.10 | Focus ring on dark background element (nav bar) | Ring contrast ≥3:1 against dark surface | |
| 8.11 | Focus ring with Windows High Contrast Mode | System focus indicator used; custom ring does not interfere | |

### Edge Cases

- Focus ring on element at page edge: ring must not be clipped by overflow:hidden
- Focus ring on element inside scrollable container: ring visible without scroll
- Alpha-blended focus ring on patterned background (stripe texture): must remain perceptible

### Failure Expectations

- If `color-mix()` unsupported (older browsers), fallback to solid outline color
- Focus must never be invisible; worst case falls back to browser default

### Recovery

- No recovery needed; focus styles are stateless CSS

---

## 9. Reduced Motion

Both pages declare `@media (prefers-reduced-motion: reduce)` to disable transitions and smooth scroll.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 9.1 | Enable reduced motion in OS settings, load index.html | No smooth scroll, no button hover transitions | |
| 9.2 | Enable reduced motion, load scorekeeper.html | No transitions on any element | |
| 9.3 | Toast appearance under reduced motion | No slide-in/fade; appears instantly, disappears instantly | |
| 9.4 | Save status chip under reduced motion | No color/opacity transition; state change is immediate | |
| 9.5 | Theme switch animation under reduced motion | Theme change is instant; no color transition | |
| 9.6 | Park card hover/focus transform under reduced motion | No translateY shift; state change is flat | |
| 9.7 | Progress bar animation (if any) under reduced motion | No width transition; bar jumps to final value | |
| 9.8 | Base diamond state change under reduced motion | Runner indicators update without animation | |
| 9.9 | Toggle reduced motion mid-session | Changes apply immediately on next interaction | |

### Edge Cases

- `transition: none !important` may override inline styles set by JS: verify no JS-driven animations bypass the media query
- CSS keyframe animations (if any) need separate `animation: none !important` rule
- Theme switcher panel open/close: if using JS transitions, must check `matchMedia` before animating

### Failure Expectations

- Under reduced motion, no element should move, fade, or transition; all changes are instantaneous
- Functionality is identical; only visual presentation changes

### Recovery

- No recovery needed; preference is OS-level and applies globally

---

## 10. Scorekeeper to Tracker Handoff

Tracker writes to `mlb_ballparks_scorekeeper_import_v1`. Scorekeeper reads on load, validates, applies venue if game is fresh. Payload expires after 1 hour.

### Test Cases

| # | Action | Expected | Pass |
|---|--------|----------|------|
| 10.1 | Click scorekeeper link on park detail (tracker) | Payload written to localStorage with venue object and exportedAt timestamp | |
| 10.2 | Open scorekeeper with fresh game + valid import | Venue auto-applied: venueName set to "{stadium} · {city}", note appended | |
| 10.3 | Open scorekeeper with existing game in progress + valid import | Import not auto-applied to active game (only fresh games) | |
| 10.4 | Open scorekeeper with expired import (>1hr) | Payload removed from localStorage, no venue applied | |
| 10.5 | Open scorekeeper with import missing `venue` key | Payload ignored, no error, no venue applied | |
| 10.6 | Open scorekeeper with import missing `exportedAt` | Payload treated as invalid, removed | |
| 10.7 | Write import from tracker, switch theme, then open scorekeeper | Theme persists independently; import still valid | |
| 10.8 | Write import from tracker with special chars in stadium name | Venue name rendered safely in scorekeeper; no XSS | |
| 10.9 | Two rapid scorekeeper link clicks on different parks | Last write wins; scorekeeper gets most recent park | |
| 10.10 | Open scorekeeper in a different browser/profile | No import found (localStorage is per-origin); clean start | |
| 10.11 | Scorekeeper reads import, applies venue, user changes venue manually | Manual venue overrides import; no re-application on next save | |
| 10.12 | Verify import note appended to game notes | Note text includes stadium and city from payload | |
| 10.13 | Export game JSON after import | `importedVenue` field contains full venue object from tracker | |

### Edge Cases

- localStorage cleared between tracker write and scorekeeper read: no import found, clean start
- Clock skew between write and read (system clock changed): 1-hour window may behave unexpectedly; test with ±2hr offset
- Import payload with extra unexpected fields: must not crash; extra fields ignored
- Scorekeeper already open in another tab when tracker writes: scorekeeper does not auto-detect (no storage event listener); user must reload

### Failure Expectations

- If localStorage read fails, scorekeeper starts with no import; no crash
- If payload parse fails, entry removed from localStorage; scorekeeper starts clean
- `readImportPayload()` always returns either a valid payload or null; never throws

### Recovery

- User can always manually enter venue in scorekeeper if import fails
- Failed import leaves no corrupted state; scorekeeper library unaffected

---

## Minimal Regression Checklist

Run after any change to either page. All items must pass before merge.

### Index.html (Tracker)

- [ ] Page loads without console errors
- [ ] All 30 park cards render with correct data
- [ ] Park filter (All / Visited / Not visited) works
- [ ] Park search filters by name, team, city
- [ ] Route board renders 3 target parks
- [ ] Scorekeeper link writes valid import payload to localStorage
- [ ] Skip link focuses main content
- [ ] Tab order reaches all interactive elements
- [ ] Focus ring visible on all focusable elements
- [ ] Reduced motion disables all transitions
- [ ] Theme switcher opens, switches theme, closes with Escape
- [ ] Theme persists on reload
- [ ] Page renders correctly at 320px, 720px, 1280px widths

### Scorekeeper.html

- [ ] Page loads without console errors
- [ ] New game creates with default state (inning 1, top, 0 outs)
- [ ] All 13 event buttons log plays correctly
- [ ] Score grid updates after each play
- [ ] Base state diamond updates after each play
- [ ] Outs increment correctly; half-inning advances at 3 outs
- [ ] Lineup inputs save on change
- [ ] Team name inputs update game title in library
- [ ] Notes textarea saves on input
- [ ] Game switch loads correct game state
- [ ] JSON export produces valid, re-importable file
- [ ] JSON import loads game and replays plays
- [ ] Import payload from tracker auto-applies venue on fresh game
- [ ] Expired import (>1hr) is ignored and removed
- [ ] Undo removes last play and recalculates state
- [ ] Reset clears plays after confirmation
- [ ] Toggle final sets game status
- [ ] Skip link focuses main content
- [ ] Tab order reaches all interactive elements
- [ ] Focus ring visible on all focusable elements
- [ ] Reduced motion disables all transitions
- [ ] Theme switcher works identically to tracker
- [ ] Page renders correctly at 320px, 720px, 1280px widths

### Cross-Page

- [ ] Theme selection persists across both pages (same `app-theme` key)
- [ ] Tracker → Scorekeeper handoff round-trips venue data
- [ ] Both pages function with localStorage disabled (graceful degradation)
- [ ] Neither page loads external resources beyond Google Fonts
- [ ] No `eval()`, `innerHTML` with user data, or unescaped template interpolation
