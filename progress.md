Original prompt: vFast, one handed game scoring. Log plate appearances, track runs by inning, manage lineups, and export a clean game record.

[2026-03-18] [MLB] [feat] Add local games library to the scorekeeper
[2026-03-18] [MLB] [feat] Add lineup management and batter rotation
[2026-03-18] [MLB] [feat] Add notes export and quick reference panel

[2026-03-18] [MLB] [test] Validate lineup scoring and game switching
[2026-03-18] [MLB] [test] Capture upgraded scorekeeper workflow screenshot

[2026-03-18] [MLB] [feat] Add standalone theme token sheet for additional club palettes
[2026-03-18] [MLB] [docs] Write project handoff with development details
[2026-03-18] [MLB] [feat] Add runtime theme loader and floating theme picker
[2026-03-18] [MLB] [refactor] Move tracker and scorekeeper colors to shared theme tokens
[2026-03-18] [MLB] [test] Verify theme switching and keyboard access across both pages
[2026-03-18] [MLB] [feat] Harden scorekeeper venue import with expiry and fresh game auto apply
[2026-03-18] [MLB] [feat] Add scorekeeper play log edit mode with replay based recalculation
[2026-03-18] [MLB] [refactor] Wrap score table for touch scroll with shared theme tokens
[2026-03-18] [MLB] [test] Validate import expiry auto apply and play edit score recalculation
[2026-03-18] [MLB] [docs] Extend implementation contracts for feedback safety and accessibility work
[2026-03-18] [MLB] [feat] Add tracker and scorekeeper toast feedback with save status chips
[2026-03-18] [MLB] [feat] Add scorekeeper game title library controls and undo recovery flows
[2026-03-18] [MLB] [refactor] Move tracker tier pills to shared theme token classes
[2026-03-18] [MLB] [feat] Add tracker empty state and keyboard shortcuts across both pages
[2026-03-18] [MLB] [test] Validate tracker handoff shortcuts and scorekeeper undo flows with DOM harness
[2026-03-18] [MLB] [refactor] Push team theme tokens to stronger stripe wash and panel treatments
[2026-03-18] [MLB] [refactor] Replace non MLB live themes with Yankees Dodgers Cubs and Mets
[2026-03-18] [MLB] [docs] Archive non MLB theme tokens for future multi sport reuse
[2026-03-18] [MLB] [refactor] Port paper style scorebook shell into the scorekeeper
[2026-03-18] [MLB] [docs] Audit external scorecard reference and capture reusable layout pieces
[2026-03-18] [MLB] [test] Validate scorebook grid render and undo flow with DOM harness
[2026-03-18] [MLB] [docs] Write scorecard v2 contract for runner and cell lifecycle
[2026-03-18] [MLB] [refactor] Add scorecard v2 scaffold and play ids to scorekeeper state
[2026-03-18] [MLB] [test] Validate scorecard v2 scaffold through saved state replay
[2026-03-18] [MLB] [refactor] Project runner lifecycle and cell state into scorecard v2
[2026-03-18] [MLB] [refactor] Switch scorebook render to scorecard v2 cell projection
[2026-03-18] [MLB] [test] Validate runner scoring projection with multi play jsdom harness
[2026-03-18] [MLB Prototype] [refactor] Add shared local-first app state for visited parks, route targets, and scorekeeper park context
[2026-03-18] [MLB Prototype] [refactor] Unify device runtime and remove scorekeeper inline device detection
[2026-03-18] [MLB Prototype] [feat] Wire index, parks, and route pages to shared local state instead of hardcoded summary content
[2026-03-18] [MLB Prototype] [feat] Add scorekeeper session persistence, setup/export, undo, and render_game_to_text hooks
[2026-03-18] [MLB Prototype] [test] Run syntax validation across prototype pages and shared scripts
[2026-03-18] [MLB Prototype] [test] Verify scorekeeper initial load with web-game client screenshot and state dump
[2026-03-18] [MLB Prototype] [test] Verify three recorded outs flip scorekeeper from away half to home half
[2026-03-18] [MLB Prototype] [test] Verify parks page route/scorekeeper actions pass venue context into scorekeeper
[2026-03-18] [MLB Prototype] [feat] Add scorekeeper away/home view tabs so the visible book can diverge from the live batting side
[2026-03-18] [MLB Prototype] [test] Verify scorekeeper side tabs render in the browser client screenshot and preserve live batting context
[2026-03-18] [MLB Prototype] [test] Verify three outs flip to home while the away book remains inspectable, then confirm home view shows home-only logged plays
[2026-03-18] [MLB Prototype] [feat] Extend shared trip state with game-aware route stops, schedule lookups, Google Maps URL helpers, and client-side ICS export
[2026-03-18] [MLB Prototype] [feat] Add upcoming-game actions on the parks page for route, scorekeeper handoff, and calendar export
[2026-03-18] [MLB Prototype] [feat] Render selected-game context on the route board and carry scheduled matchup metadata into the scorekeeper
[2026-03-18] [MLB Prototype] [fix] Flush active trip writes immediately so selected-game route state survives instant page navigation
[2026-03-18] [MLB Prototype] [fix] Define schedule month labels so upcoming-game formatting no longer breaks the parks detail panel
[2026-03-18] [MLB Prototype] [test] Verify parks page renders four upcoming PNC game actions and route store persists selected game ids
[2026-03-18] [MLB Prototype] [test] Verify route board shows selected game line for PNC and keeps calendar action attached to the chosen stop
[2026-03-18] [MLB Prototype] [test] Verify scorekeeper prefills Orioles at Pirates with game id and local start time from park-selected schedule context
[2026-03-18] [MLB Prototype] [test] Verify ICS generation emits VCALENDAR/VEVENT headers plus DTSTART and DTEND for the selected PNC game
[2026-03-18] [MLB Prototype] [feat] Add browser-based test-suite.html covering 88 scenarios across fresh load, browsing, route planning, scorekeeper, theme, schedule, storage, navigation, and edge cases
[2026-03-18] [MLB Prototype] [fix] Remove seeded visits and default route stops so fresh-load scenarios begin at 0 visited and an empty route
[2026-03-18] [MLB Prototype] [fix] Align harness persistence expectations with parks-page behavior that auto-adds newly visited parks to the route
[2026-03-18] [MLB Prototype] [test] Run the localhost harness and pass all 47 automated scenarios with 0 failures; leave 41 scenarios marked manual for visual/device/runtime coverage
[2026-03-18] [MLB Prototype] [fix] Constrain the scorekeeper story poster/video stack with an aspect-ratio frame and absolute media layers so missing-video fallback art no longer blows out the cover panel
[2026-03-18] [MLB Prototype] [test] Verify the scorekeeper cover poster and video share the same bounded media rect in browser capture after the fallback layout fix
[2026-03-18] [MLB Prototype] [fix] Hide the scorekeeper video fallback card by default so it only appears after a real playback failure instead of during normal load
[2026-03-18] [MLB Prototype] [test] Verify the story fallback stays hidden while the cover video loads and plays successfully
[2026-03-18] [MLB Prototype] [fix] Replace the scorekeeper cover poster asset with a real frame from the MP4 so preload and fallback states no longer show the app icon graphic
[2026-03-18] [MLB Prototype] [test] Verify the poster image and video poster attribute both point to the extracted scorekeeper cover still
[2026-03-18] [MLB Prototype] [todo] Optional third pass: promote the side tabs into a fuller dual-book model with separate lineup names and simultaneous away/home scorebook surfaces
[2026-03-18] [MLB] [feat] Add resolver.js with default runner advancement for walk, hit, homer, strikeout, fly out, sac fly, ground out, double play, fielder choice, error, stolen base, caught stealing, and wild pitch
[2026-03-18] [MLB] [feat] Add guided play picker and projected result preview to the root scorekeeper
[2026-03-18] [MLB] [refactor] Sync scorekeeper base state through guided play resolution while preserving manual fallback logging
[2026-03-18] [MLB] [fix] Add visible quick note composer to scorekeeper cover and enlarge notes rail input
[2026-03-18] [MLB] [todo] Add correction chips, stranded runner cell annotation, and retroactive diamond writeback using runner cellRef
