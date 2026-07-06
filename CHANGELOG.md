# Changelog

All notable development history for MLB Ballparks Quest, grouped by date. Commit subjects are taken directly from `git log`.

## 2026-07-06
- Add LICENSE: explicit all-rights-reserved

## 2026-04-28
- Add credited Commons ballpark photos
- Replace park coordinates with field context
- Improve Ballparks Quest layout, compare flow, route state, and visit logging
- Fix park detail visuals with generated identity cards

## 2026-04-22
- feat: replace Phillies schedule with Wire cutover stub

## 2026-04-16 to 2026-04-18
- docs: add required Project Overview, Stack, and Key Decisions sections to CLAUDE.md
- fix: Silence SW registration warning and add project docs
- fix: Include shared/js/core modules needed by page scripts
- fix: escape scorekeeper team names and bump sw cache
- fix: Sync storage.js quota guard from quest-platform
- chore: Bump SW cache to v4 and remove deprecated AGENTS.md

## 2026-03-19 to 2026-03-21
- chore: add local archives ignore
- chore: sync local changes
- refactor: standardize state classes to .is-* prefix and add CLAUDE.md
- chore: archive mlb-prototype/ to archives/
- Bump service worker cache to v2 to bust stale festival data
- fix: add responsive handling to Phillies schedule page
- fix: add portfolio back link to index, parks, route pages
- polish: add meta descriptions, prefers-reduced-motion, favicon fixes
- chore: cross-project agent sweep — OG meta, a11y, perf fixes

## 2026-03-18 — Initial build-out (single day, high commit volume)
Core product took shape across a large batch of same-day commits:

**Foundations**
- Add MLB Ballparks Quest dashboard with game scorer v0
- Ship static tracker and scorekeeper workflow
- Build Ballparks Quest prototype planning infrastructure
- Add MLB prototype harness and schedule artifacts
- Promote prototype to root as version 0.8

**Route planning**
- Refine prototype route planning hierarchy
- Strengthen prototype route planning surface
- Make prototype route page more usable
- Refine prototype planning surfaces and finish flow
- Make route planner trip aware

**Scorekeeper**
- Add guided scorekeeper resolver v1
- Improve scorekeeper notes access
- Move Add to Route and Mark Visited to top of detail panel
- Add schedule integration, scorekeeper theme switcher, and audit fixes

**Theming**
- Apply Phillies theme pass and capture validation artifacts
- Add theme token sheet and project handoff
- Add runtime theme switcher
- Add MLB UX validation docs and stronger team themes
- Port scorebook layout and archive non MLB themes

**Data & imagery**
- Add schedule import tool and session docs
- Switch schedule import to Gemini 2.5 Flash with Google Search
- Expand schedule to 27 parks (1954 games), remove leaked API key
- Add ESPN team logos to park data and scorekeeper linescore
- Add hero and park imagery (x3)
- Add local team logos and wire them into the prototype
- Replace wrong icon pack with real local MLB logos (x2)
- Fix misplaced team logos in prototype
- Refine Phillies 2026 schedule UX
- Add Nationals opener to Phillies 2026 schedule

**Infra**
- Harden prototype rendering fonts and offline shell
- Unify prototype map helpers and breakpoints
- Add GitHub Pages deploy workflow
