# MLB Ballparks Quest — Feature Analysis

**Date:** 2026-03-25
**Project:** mlb-ballparks-quest
**Stack:** Static HTML/CSS/JS, localStorage, Service Worker PWA, GitHub Pages

---

## Summary Table

| Feature | Status | Data Source / Persistence | Critical Gap |
|---|---|---|---|
| Ballpark Visit Tracker | Complete | localStorage (`bpq.prototype:visits`) | No cloud backup; data loss on clear |
| 30-Park Directory w/ Detail Panel | Complete | Seeded in `data.js` (static) | Park data is hardcoded; no update mechanism |
| Route Planner w/ Leg Builder | Complete | localStorage (`bpq.prototype:activeTrip`) | No drag-to-reorder stops; no multi-trip support |
| Scorekeeper (Full Scorecard Grid) | Complete | localStorage (`scorekeeperState`, `scorekeeperExports`) | Large single-file HTML (~33k tokens); hard to maintain |
| 2026 Schedule Integration | Complete | Hardcoded in `schedule.js` | Entire season baked in; no import for future years |
| Theme Switcher (5 MLB Themes) | Complete | localStorage (`app-theme`) | Only 5 teams; no user-custom theme path |
| SVG Route Map Visualization | Complete | Computed from coordinates in `data.js` | Stylized US outline, not real geography |
| Trip Notes / Scratchpads | Complete | localStorage (`planningNotes`) | No export; notes trapped in browser |
| ICS Calendar Export | Complete | Generated in-memory, downloaded as `.ics` | Single-game only; no bulk trip export |
| Service Worker / PWA | Complete | Cache-first via `sw.js` | Stale cache risk if version not bumped |
| Ticket Intelligence Badges | Complete | Derived from `ticketApproach` text in `data.js` | Heuristic keyword match, not real-time pricing |
| Google Maps Deep Links | Complete | Constructed in `app.js` via `buildMapsUrl()` | Opens external Maps; no embedded map |
| Per-Park Research Scratchpad | Complete | localStorage (`planningNotes` scoped to park) | No cross-device sync |
| Resolver Engine (Base Running) | Complete | `resolver.js` — pure state machine | Large file; no test harness included |
| Team Logo System | Complete | Local PNG assets mapped in `logos.js` | 30 static images; no CDN fallback |
| Responsive Layout | Complete | CSS media queries at 1200/900/640px | No hamburger menu; nav links wrap on narrow screens |
| Accessibility | Partial | Skip link, focus-visible, aria-live, reduced-motion | Scorekeeper grid keyboard navigation unclear |
| Quest-Platform Shared Core | Active | `shared/js/core/` — config, storage, utils, device | Products still carry shim files; not fully decoupled |

---

## Detailed Feature Analysis

### 1. Ballpark Visit Tracker

**Problem it solves:** Lets the user track which of the 30 MLB parks they have visited, with date, rating, standout feature, and notes per visit.

**Implementation:** `app.js` exposes `markVisited()`, `unmarkVisited()`, `toggleVisited()`, and `getVisitedParks()`. Visit records are stored as an array under the `visits` key in namespaced localStorage (`bpq.prototype:visits`). Each visit carries an `id`, `parkId`, `visitDate`, `rating`, `bestFeature`, `notes`, `createdAt`, and `updatedAt`. The storage layer in `storage.js` uses debounced writes (140ms default) via the quest-platform shared core to avoid thrashing localStorage on rapid updates.

**Tradeoffs and limitations:**
- All data lives in a single browser's localStorage. Clearing site data destroys everything.
- No export/import for visit history. Users cannot move their data to another device.
- Visit dates default to today if not explicitly set.

### 2. 30-Park Directory with Detail Panel

**Problem it solves:** Provides a browseable, filterable reference of all 30 MLB parks with rich metadata (capacity, opened year, roof type, tier ranking, ticket approach, transit notes, special events).

**Implementation:** `data.js` contains a `SEEDED_PARKS` array with all 30 parks. `parks.html` renders a two-column layout: scrollable park list on the left, sticky detail panel on the right. Filtering supports search (name/team/city), visited/unvisited status, and roof type (open/retractable). The detail panel shows an inline SVG mini-map with the park's projected coordinates, a data grid, ticket/transit signals, upcoming games, and a per-park scratchpad textarea.

**Tradeoffs and limitations:**
- All park metadata is static. Renamed parks, capacity changes, or new stadiums require a code edit.
- The Oakland A's migration to Sacramento (Sutter Health Park) is handled via a data migration in `initializeVisits()` that rewrites `oakland-coliseum` to `sutter-health-park`.

### 3. Route Planner with Leg Builder

**Problem it solves:** Lets the user compose a multi-stop road trip, see driving legs with distance/time estimates, attach games to stops, and manage leg status (idea/active/booked/completed).

**Implementation:** `route.js` and `route.html` render a planning deck (trip notes + summary), route stop cards, an SVG route map, and leg cards. Legs are auto-generated between consecutive stops using Haversine distance calculation from `utils.js`. Each leg card shows: travel time estimate, ticket intelligence badge (derived from keyword analysis of `ticketApproach`), schedule integration (upcoming games or games in trip window), scratchpad notes with auto-extracted date/price/warning anchors, and a leg status state machine. Trip window (start/end date) filters displayed games.

**Tradeoffs and limitations:**
- Distance is straight-line Haversine, not actual road distance. Travel time assumes 58 mph average.
- No drag-to-reorder for stops; add/remove only.
- Single active trip at a time; no trip history or comparison.

### 4. Scorekeeper

**Problem it solves:** Full-featured baseball scorecard grid for live game scoring — lineup entry, at-bat recording, base running resolution, pitch tracking, and game notes.

**Implementation:** `scorekeeper.html` is a self-contained ~33k token single file with its own CSS, the resolver engine, and extensive inline JavaScript. It uses a context system (`setScorekeeperContext()` in `app.js`) so the route/parks pages can launch the scorekeeper pre-loaded with the correct park, team, and game. The resolver (`resolver.js`) is a pure-function state machine that handles walks, singles, doubles, triples, home runs, fielder's choices, double plays, stolen bases, caught stealing, sacrifices, and errors — computing base runner advancement and runs scored. Theme switching via `theme-switcher.js` applies team-specific color overrides.

**Tradeoffs and limitations:**
- The file is extremely large for a single HTML page, making maintenance risky.
- No game-to-game history browser; exports are stored but not surfaced in a review UI.
- Keyboard navigation in the scorecard grid cells is not fully documented for accessibility.

### 5. 2026 Schedule Integration

**Problem it solves:** Shows upcoming home games for each park, lets users attach specific games to route stops, and filters games by trip window dates.

**Implementation:** `schedule.js` contains a `SCHEDULE_2026` object keyed by park ID, with each entry being an array of game objects (`{d, y, t, o, s, h}`). Helper functions: `getGamesForPark()`, `getUpcomingGames()`, `getGamesInWindow()`, `decorateGame()`, `formatGameLine()`. Games can be attached to route stops and passed to the scorekeeper as context.

**Tradeoffs and limitations:**
- The entire 2026 season is hardcoded. The `schedule-import.html` page exists but schedule data requires manual entry or code update.
- No live score or postponement awareness.

### 6. Theme Switcher (5 MLB Themes)

**Problem it solves:** Lets users personalize the scorekeeper with team-specific color palettes.

**Implementation:** `theme-switcher.js` manages a registry of 5 themes (Phillies, Yankees, Dodgers, Cubs, Mets) stored in localStorage under `app-theme`. Applies via `data-theme` attribute on `<html>`. CSS custom properties in `scorekeeper.html` define `--team-primary`, `--team-secondary`, and `--sc-gold` overrides per theme. `theme-switcher-ui.js` renders a fixed-position floating panel with swatch buttons. Phillies is the default and brand identity.

**Tradeoffs and limitations:**
- Only 5 of 30 teams are supported.
- Theme only affects the scorekeeper page, not the main app pages.

### 7. Service Worker / PWA

**Problem it solves:** Enables offline access and installability.

**Implementation:** `sw.js` uses a cache-first strategy with versioned cache name (`bpq-prototype-v2`). Precaches all HTML pages, CSS, JS, fonts, icons, and the manifest. On activation, deletes old cache versions. `manifest.json` provides installability metadata.

**Tradeoffs and limitations:**
- If `CACHE_NAME` is not bumped on deploy, users get stale content until the SW updates.
- Font files and assets are precached, which increases initial install size.

### 8. Quest-Platform Shared Core Integration

**Problem it solves:** Extracts common infrastructure (storage, utils, device detection, config) into a shared layer that both MLB Ballparks Quest and Festival Atlas consume.

**Implementation:** `shared/js/core/` contains `config.js` (product registry), `storage.js` (debounced localStorage with namespacing, scoping, and migration), `utils.js` (Haversine, formatting, SVG projection, XSS-safe escaping), and `device.js` (viewport/device detection). Product-specific shim files (`mlb/config.js`, `mlb/storage.js`, `mlb/utils.js`, `mlb/device.js`) adapt the shared core to the `BPQ` namespace expected by existing code.

**Tradeoffs and limitations:**
- Shim files add indirection. Both the shared core and the product shims must be loaded in correct order.
- Not yet using ES modules; relies on IIFE/global namespace pattern.

---

## Top 3 Priorities

1. **Data portability** — Add JSON export/import for visits, route, and notes. Without this, the entire quest history is one browser-clear away from being lost. This is the single highest-risk gap.

2. **Scorekeeper maintainability** — Extract scorekeeper CSS and JS from the monolithic HTML file into separate files. The current 33k-token single file is fragile for ongoing development.

3. **Schedule update path** — Build a lightweight schedule import flow (CSV or JSON paste) so the app can accept 2027+ seasons without code changes. The `schedule-import.html` stub exists but needs completion.
