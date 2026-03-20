# MLB Ballparks Quest — Agent Instructions

> Ballpark visit tracker and game scorekeeper with a Phillies-default theme system.

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
