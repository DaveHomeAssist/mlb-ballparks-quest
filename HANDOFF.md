# MLB Ballparks Quest Handoff

## Project Summary

MLB Ballparks Quest is a lightweight static website for planning ballpark visits and logging games. It now ships as a two page product set:

1. `index.html`
   The tracker page for route planning, park browsing, and venue context
2. `scorekeeper.html`
   The standalone scoring page for game setup, lineups, plate appearances, inning totals, notes, and export

The current visual default is a Phillies flavored cream, red, and navy theme.

## Current Product Shape

### Tracker

`index.html` is the primary public page.

It includes:

1. Hero with clear route planning call to action
2. Progress board with visited and remaining counts
3. Park directory and detail view
4. Scorekeeper handoff into the second page
5. Roadmap and supporting sections

### Scorekeeper

`scorekeeper.html` is the second page and works as a standalone local scoring workspace.

It includes:

1. Games library
2. Game setup
3. Two team lineup editor
4. Plate appearance event buttons
5. Auto derived score grid by inning
6. Base state display
7. Play log
8. Game notes
9. JSON export
10. Notes export
11. Tracker venue import

## Key Files

1. `index.html`
   Static tracker page
2. `scorekeeper.html`
   Standalone scorekeeper page
3. `theme-tokens.css`
   Standalone theme token sheet for future team themes
4. `steam-style-writeup.txt`
   Store style product description and feature set
5. `progress.md`
   Session level notes and recent work record
6. `mlb-dashboard.jsx`
   Older source artifact with prior React era ideas. Not the current shipped source of truth

## Source Of Truth

The current source of truth for the shipped product is:

1. `index.html`
2. `scorekeeper.html`
3. `theme-tokens.css`

Do not treat `mlb-dashboard.jsx` as canonical without an explicit migration pass.

## Architecture Notes

The product is intentionally static and low overhead.

Current constraints:

1. No framework runtime in shipped pages
2. No bundler
3. No CDN dependency
4. Static hosting friendly
5. Local first data flow
6. Hand editable source

Both shipped pages use:

1. Embedded CSS
2. Embedded JavaScript
3. Minimal stateful DOM updates
4. Local storage for persistence and handoff

## Data And Storage

### Tracker To Scorekeeper Handoff

`index.html` writes selected park context to:

```text
mlb_ballparks_scorekeeper_import_v1
```

Payload shape:

```json
{
  "exportedAt": "ISO date",
  "venue": {
    "id": "park id",
    "team": "team name",
    "stadium": "stadium name",
    "city": "city, state",
    "roof": "roof type",
    "surface": "surface type",
    "tier": "tier label",
    "bestFeature": "short note"
  }
}
```

### Scorekeeper Persistence

`scorekeeper.html` stores its local library in:

```text
mlb_ballparks_scorekeeper_state_v1
```

Current model:

1. Library version
2. Active game id
3. Array of saved games

Game object fields include:

1. `id`
2. `createdAt`
3. `updatedAt`
4. `title`
5. `awayName`
6. `homeName`
7. `venueName`
8. `innings`
9. `status`
10. `importedVenue`
11. `notes`
12. `lineups.away`
13. `lineups.home`
14. `plays`
15. `state.inning`
16. `state.half`
17. `state.outs`
18. `state.bases`
19. `state.batterIndex`

## Recent Development Work

### Static Tracker Rebuild

The tracker page was rebuilt from a heavier React style artifact into a static single page HTML implementation.

Main changes:

1. Removed React runtime cost
2. Removed Babel runtime cost
3. Removed CDN dependency
4. Kept park data and route logic
5. Preserved GitHub Pages friendliness

### Scorekeeper Build

The scorekeeper was added as a second standalone page.

Main changes:

1. New scoring workspace
2. Tracker handoff support
3. Games library
4. Lineup management
5. Batter rotation
6. Inning scoring
7. JSON export
8. Notes export

### Phillies Theme Pass

Both shipped pages now use a Phillies flavored visual system.

Main changes:

1. Cream background
2. Phillies red accent
3. Deep navy primary ink
4. Subtle stripe texture
5. Shared brand mark treatment

### Theme Token Sheet

`theme-tokens.css` was added for future skins.

Included palettes:

1. Phillies
2. Yankees
3. Dodgers
4. Cubs
5. Mets
6. Red Sox
7. Giants
8. Padres

The live pages still use inline tokens. The CSS sheet is the reusable reference for the next theme system pass.

## Validation Artifacts

Current validation artifacts in the repo:

1. `desktop-check.png`
2. `mobile-check.png`
3. `scorekeeper-desktop-check.png`
4. `scorekeeper-mobile-check.png`
5. `scorekeeper-workflow-check.png`
6. `phillies-theme-index-check.png`
7. `phillies-theme-scorekeeper-check.png`
8. `output/web-game/scorekeeper-workflow-pass/shot-0.png`

These were used to confirm:

1. Static render quality
2. Mobile render quality
3. Scorekeeper workflow integrity
4. Theme pass visual sanity

## Deployment Status

Repo:

```text
https://github.com/DaveHomeAssist/mlb-ballparks-quest.git
```

Latest pushed commit at handoff time:

```text
5b8ac29
```

Expected live URL:

```text
https://davehomeassist.github.io/mlb-ballparks-quest/
```

## Known Limitations

1. Theme tokens are duplicated inline in the shipped pages and separately in `theme-tokens.css`
2. No runtime theme switch exists yet
3. Scorekeeping logic is intentionally simplified and not a full rules engine
4. JSON import accepts scorekeeper files but does not yet show import validation UI beyond console level failure handling
5. Validation artifacts are committed and may not belong in the long term repo shape

## Recommended Next Work

### Highest Value

1. Connect `theme-tokens.css` to both pages and remove duplicated inline token blocks
2. Add a small theme switch pattern using `data-theme`
3. Strengthen Phillies identity in content, not just color
4. Add lineup aware export filenames and more readable notes export headings
5. Add edit controls for logged plate appearances

### Good Follow On Work

1. Add batting order indicators directly in the lineup editor
2. Add inning edit correction tools
3. Add final game summary block
4. Add shareable export snapshot for tracker progress
5. Trim repo artifacts if the screenshots are no longer needed

## Suggested Execution Order

1. Theme system integration
2. Phillies content pass
3. Scorekeeper edit correction pass
4. Export polish pass
5. Repo cleanup pass

## Developer Notes

1. Keep the site static
2. Keep the DOM lean
3. Preserve local first behavior
4. Prefer direct readable JavaScript over abstractions
5. If a future pass adds a theme switch, keep Phillies as the default unless product direction changes
