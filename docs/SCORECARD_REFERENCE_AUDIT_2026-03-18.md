# Scorecard Reference Audit

Reference file:
`/Users/daverobertson/Library/Mobile Documents/com~apple~CloudDocs/00 Inbox/scorecard-diamond (1).html`

## Reusable Pieces

1. Paper score sheet framing with a strong header, venue line, and game status line
2. Line score table above the scoring grid
3. Batter spine at left with numbered slots
4. Inning by inning scoring cells in narrow vertical columns
5. Totals rail at right for simple batter totals
6. Diamond style cell marks that read as baseball first
7. Larger base diamond below the grid for live runner state
8. Darker control surface separate from the paper score area

## Pieces Rejected

1. External Google Fonts
2. Full paper texture background image treatment
3. Full manual box score workflow that would replace the existing scoring engine
4. Visual complexity that would slow the static page or crowd the current controls

## MLB Hybrid Decision

1. Keep the current line score, play log, import flow, export flow, and replay based scoring logic
2. Replace the old split lineup plus score grid plus diamond cards with one scorebook shell
3. Show the active batting side as the current paper card rather than forcing both teams on screen at once
4. Keep the editable lineups below the scorebook so the logic and input path stay simple
5. Use lightweight CSS diamonds and compact inning cells instead of a full scorecard engine rewrite

## Ported Into Scorekeeper

1. Scorebook shell layout
2. Paper style inning grid
3. Batter spine
4. Totals rail
5. Out pips
6. Larger integrated base diamond
7. Header metadata line for date, venue, and live status
