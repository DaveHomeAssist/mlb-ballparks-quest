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
[2026-03-18] [MLB Prototype] [todo] Optional third pass: promote the side tabs into a fuller dual-book model with separate lineup names and simultaneous away/home scorebook surfaces
