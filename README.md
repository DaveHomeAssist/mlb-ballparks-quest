# MLB Ballparks Quest

A static, no-build progressive web app for tracking your visits to all 30 MLB ballparks, planning multi-park road trips, and keeping score at the games you attend.

## What's here

| Path | What it is |
|---|---|
| `index.html` | **The Pilgrimage** — main tracker: progress board, park directory, and route-planning entry point |
| `parks.html` | Browsable directory of all 30 MLB parks with detail panels (tier, roof, surface, ticket/transit notes) |
| `route.html` | Trip planner — build a multi-park route, attach notes/dates, and see per-leg context |
| `scorekeeper.html` | Standalone live game scorekeeper: lineups, plate-appearance logging, inning-by-inning score grid, notes, JSON export |
| `phillies-2026-schedule.html` | Wire cutover stub for the Phillies 2026 schedule page |
| `schedule-import.html` | Internal tool for importing/generating schedule data |
| `data.js` | Seed data for all 30 parks (team, city, capacity, tier, roof/surface, ticket approach, transit notes, coordinates) |
| `schedule.js` | Full multi-season schedule data (27 parks, ~1,954 games) |
| `logos.js`, `logos/` | Local MLB team logo assets |
| `resolver.js` | Guided at-bat resolver — turns a scored event (single, double, sac fly, double play, wild pitch, etc.) into base/runner state changes |
| `theme-switcher.js`, `theme-switcher-ui.js` | Runtime team-theme switcher (Phillies default, plus Yankees/Dodgers/Cubs/Mets) |
| `storage.js`, `shared/js/core/` | localStorage wrapper and shared modules (config, device, notes, schedule-core, visits, utils) used across pages |
| `sw.js`, `manifest.json`, `icons/` | Service worker + PWA manifest for offline/installable support |
| `docs/` | Design/audit/planning notes from development (UX audits, implementation contracts, deep-research reports) |
| `archive/` | Retired earlier build (`v0.7-root`), kept for reference and excluded from active development |
| `assets/`, `fonts/`, `*-check.png`, `VIDEO-*.mp4` | Imagery, custom web fonts, and visual validation artifacts captured during development |

## How to run

This is a zero-backend, zero-build static site — vanilla JS, no npm, no bundler.

- **Quickest:** open `index.html` directly in a browser.
- **Recommended** (so the service worker and fetches behave like production): serve the folder with any static file server, e.g.:
  ```
  npx serve .
  ```
  or
  ```
  python -m http.server 8000
  ```
  then visit `http://localhost:PORT/index.html`.
- **Live deployment:** pushes to `main` trigger `.github/workflows/deploy.yml`, which publishes the repo root to GitHub Pages.

## Conventions

- Module pattern: IIFE with namespace attachment (`window.BPQ`, `window.__QUEST_PLATFORM__`).
- CSS classes: kebab-case. State classes use an `.is-*` prefix (e.g. `.is-visited`).
- JS: camelCase for JS-bound element IDs, kebab-case for navigation anchors, UPPER_SNAKE_CASE for constants.
- All persistent state lives in `localStorage` (visits, route/trip data, scorekeeper games, theme preference) — there is no server or database.
- See `CLAUDE.md` for the full architecture reference and issue tracker used during development.

## Note on team branding

This project displays real MLB team names, colors, and logos (see `logos/` and `data.js`) for identification purposes within a fan-made tracking tool. This is a known trademark consideration for the project owner and is called out here for documentation completeness; no changes to that branding are made by this README.
