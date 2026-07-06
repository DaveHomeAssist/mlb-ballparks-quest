# MLB Ballparks Quest — Player Guide

## The basics

MLB Ballparks Quest is a personal tracker for the "ballpark pilgrimage" — the goal of visiting all 30 Major League Baseball stadiums. It's built as a small suite of static pages that work together:

- **`index.html` ("The Pilgrimage")** — your home base. Shows your progress toward all 30 parks, a directory of parks, and your logged visits.
- **`parks.html`** — the full 30-park directory with detail cards and a side-by-side comparison tool.
- **`route.html`** — a trip planner for stitching multiple parks into one road trip.
- **`scorekeeper.html`** — an independent live scorebook for the games you actually attend.

There's no account and no server: everything you do is saved to your browser's `localStorage`, so your progress lives on the device/browser you used to log it.

## The quest mechanic: tracking your 30-park progress

Each of the 30 MLB parks in `data.js` carries:

- **Tier** (S/A/B/C) — a rough "how special is this ballpark" rating
- **Roof type** — Open, Retractable, or Fixed
- **Ticket approach** and **transit notes** — practical tips for buying seats and getting there
- **Special events** — recurring promotions/fireworks/giveaway nights worth planning around

From the park directory (`parks.html`) or the tracker (`index.html`) you can:

1. **Mark Visited** — flips a park to visited and stamps a visit date. Visited parks show up in the "Visited" section on the tracker with your notes and the date.
2. **Add to Route** — sends a park into the trip planner (`route.html`) instead of (or in addition to) marking it visited.
3. **Compare** — on `parks.html`, add multiple parks to the comparison drawer to see their tiers, roofs, and ticket/transit notes side by side before deciding where to go next.

Your progress board on `index.html` tallies visited vs. remaining out of 30 — that count is the "quest" score. There's no win-state screen; completion is simply reaching 30/30.

## Planning a trip: `route.html`

The route planner lets you build a multi-stop itinerary:

- Add parks (from the tracker or park directory) into your route.
- Attach trip-level notes, a start/end date, and per-leg scratch notes (dates, ticket price targets, warnings).
- The planner surfaces automatic warnings pulled from each park's `specialEvents` data — e.g. it'll flag a leg landing on a "Friday fireworks" night or a bobblehead giveaway, since those dates usually mean tighter ticket supply and bigger crowds.
- A trip summary card rolls up your route so you can sanity-check the whole plan at a glance.

## Scoring a game: `scorekeeper.html`

This is a separate, standalone tool for keeping score at a real game — it doesn't require you to have logged the ballpark in the tracker first, though it can import venue context if you came from there.

1. **Games library** — start a new game or resume one from your saved library (multiple games persist locally).
2. **Game setup** — enter away/home team names, venue, and number of innings.
3. **Lineups** — build a batting order for both teams.
4. **Plate-appearance events** — as the game happens, log each at-bat as an event: single, double, triple, home run, walk, strikeout, fly out, sac fly, ground out, double play, fielder's choice, error, stolen base, caught stealing, or wild pitch.
5. **Guided resolver** — you don't have to track base-runner movement yourself. The resolver (`resolver.js`) takes the event you pick plus current base/out state and automatically works out which runners advance, who scores, and how many outs are recorded.
6. **Score grid** — runs are automatically rolled up into a per-inning line score as you log events.
7. **Play log & notes** — every event is kept in a running log, and you can attach freeform notes to the game.
8. **Export** — export the game as JSON (full structured record) or as a notes export (readable summary), for keeping your own archive outside the browser.

## Themes

The app ships with a runtime team-theme switcher (`theme-switcher.js`). Phillies is the default/locked brand identity; you can also switch the visual theme to Yankees, Dodgers, Cubs, or Mets. This only changes colors/branding — it doesn't affect your saved data.

## Where your data lives

Everything is local to your browser:

- Visit status, notes, and dates
- Route/trip state
- Scorekeeper game library
- Theme preference

Clearing your browser's site data for this app will reset your progress, since there is no cloud sync or account system.
