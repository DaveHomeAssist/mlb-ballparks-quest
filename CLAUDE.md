# MLB Ballparks Quest — Agent Instructions

> Ballpark visit tracker and game scorekeeper with a Phillies-default theme system.

## Project Overview

Two-page Progressive Web App for tracking MLB ballpark visits, planning stadium road trips, and scorekeeping live games. Phillies-branded by default with a pluggable 5-team theme system.

## Stack

- Vanilla JS (IIFE/namespace module pattern)
- No npm, no build step, no transpilation
- localStorage via debounced wrapper (`storage.js`)
- PWA with service worker (`sw.js`) and `manifest.json`
- GitHub Pages deployment from `main`

## Key Decisions

- Two distinct entry points: `index.html` (tracker/route planner) and `scorekeeper.html`.
- Phillies theme is the locked default and brand identity. Other themes are additive options.
- Data split across dedicated modules: `data.js` (30 parks), `logos.js` (SVG paths), `theme-switcher.js`.
- Service worker cache versioning is critical. Stale cache prevention is a hard requirement.
- Accessibility features (focus management, reduced-motion, keyboard nav) must not be weakened.

## Architecture

- Zero backend — no server, no database, no API calls
- No npm, no build step, no transpilation
- Two-page product: `index.html` (tracker/route planner) and `scorekeeper.html` (game scoring)
- localStorage for all persistent state (visits, games, route, theme preference)
- Progressive Web App with service worker (`sw.js`) and `manifest.json`
- Pluggable theme system via `theme-switcher.js` (5 MLB team themes)

## Conventions

- Follow shared naming conventions: `30-shared-resources/shared-standards/NAMING_CONVENTIONS.md`
- CSS classes: kebab-case
- JS IDs: camelCase for JS-bound elements, kebab-case for navigation anchors
- Constants: UPPER_SNAKE_CASE
- Module pattern: IIFE with namespace attachment
- State classes: `.is-*` prefix

## Key References

| Domain | Canonical Source |
|---|---|
| Park data | `data.js` (30 MLB parks with coordinates, metadata) |
| Team logos | `logos.js` (SVG paths per team) |
| Storage layer | `storage.js` (debounced localStorage wrapper) |
| Theme registry | `theme-switcher.js` (phillies, yankees, dodgers, cubs, mets) |
| Design tokens | `shared.css` `:root` block |
| Typography | Playfair Display (display), DM Sans (body), DM Mono (data) |
| Service worker | `sw.js` (cache versioning) |
| Naming standards | `30-shared-resources/shared-standards/NAMING_CONVENTIONS.md` |

## Deployment

- **Host:** GitHub Pages
- **Branch:** main
- **URL:** https://davehomeassist.github.io/mlb-ballparks-quest/
- **Process:** `git push` triggers deploy
- **Entry points:** `index.html` (tracker), `scorekeeper.html` (scoring)

## What Not To Do

- Do not add a backend, database, or server requirement
- Do not introduce npm, package.json, or any build tooling
- Do not add external JS/CSS dependencies
- Do not change the Phillies default theme — it is the brand identity
- Do not modify `storage.js` debounce behavior without testing quota edge cases
- Do not break theme switching during active scorekeeper sessions
- Do not remove service worker cache versioning — stale cache prevention is critical
- Do not remove or weaken accessibility features (focus management, reduced-motion, keyboard nav)

## Documentation Maintenance

- **Issues**: Track in CLAUDE.md issue tracker table below. When project gets a `docs/UI_ISSUES_TABLE.html`, migrate there.
- **Session log**: Append to `/Users/daverobertson/Desktop/Code/95-docs-personal/today.csv` after each meaningful change

## Issue Tracker

| ID | Severity | Status | Title | Notes |
|----|----------|--------|-------|-------|
| 001 | P2 | resolved | Promote prototype to primary root app | Archived the old root build as v0.7 and promoted the prototype to the root entry path as v0.8 |
| 002 | P2 | resolved | Make scorekeeper notes reachable before first pitch | Added a visible quick note composer in the cover card and enlarged the notes rail composer |

## Session Log

[2026-03-18] [MLB] [feat] Add local team logos to prototype
[2026-03-18] [MLB] [fix] Replace wrong icon pack with real MLB team marks
[2026-03-18] [MLB] [feat] Promote prototype build to primary root app v0.8
[2026-03-18] [MLB] [fix] Harden Phillies 2026 schedule page interactions
[2026-03-18] [MLB] [feat] Add guided resolver engine to scorekeeper
[2026-03-18] [MLB] [fix] Make scorekeeper notes composer visible and easier to reach
