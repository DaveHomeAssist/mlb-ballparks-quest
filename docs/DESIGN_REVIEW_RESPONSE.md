# MLB Ballparks Quest — Design Review Response

> **Source:** Luxury/editorial design critique (8 sections, 8 recommendations)
> **Cross-referenced against:** UX_AUDIT_2026-03-18.md, IMPLEMENTATION_PLAN_2026-03-18.md, IMPLEMENTATION_CONTRACTS.md
> **Date:** 2026-03-18

---

## What the Review Got Right

The review correctly identifies the product's strongest qualities:

1. **The two-page contrast works.** Tracker = public-facing planner. Scorekeeper = intimate field instrument. That's intentional and should be preserved.
2. **The palette is the star.** Wine/cream/navy + 5-theme system with washes and stripe textures is the highest-value design work in the project.
3. **The restraint is a feature.** No stock photography, no gratuitous animation, no framework bloat. The review correctly notes this is working in the product's favor.
4. **The scorekeeper needs to be elevated, not redesigned.** The direction is right. It needs more scale and focus, not a different approach.

---

## What It Misses (and the UX Audit Catches)

The review is purely aesthetic. It doesn't mention:

- The form that goes nowhere (S1-1, S1-2 — now fixed via Notion integration)
- The reset button with no confirmation (S1-1 — in implementation plan)
- The broken import validation (S1-3 — in implementation plan)
- The zero feedback system (S1-2 — toast system in Batch A)
- The hardcoded visited state (S2-5 — in Batch C)
- The accessibility gaps (focus contrast, keyboard shortcuts, lineup guidance)

**Lesson:** Beautiful products still fail if the plumbing doesn't work. The design review and the UX audit are complementary, not competing.

---

## Recommendation-by-Recommendation Actionability

### R1: Bespoke display type for heroes and scorebook

**Verdict: Do it.** This is the single highest-impact design change.

**Implementation:**
- Add a display serif font for hero headlines, section kickers, and scorebook title
- Candidates: Playfair Display (already in the system font stack but not used at display weight), or Fraunces (used in Garden OS, proven to work in this weight range)
- Apply to: hero `h1`, section `.section-kicker`, scorebook `.scoreboard-title`, game library labels
- Keep DM Sans/system-ui for body, controls, and metadata

**Scope:** CSS-only change. Add one `@import` for the display font, define `.display-serif` class, apply to ~15 elements across both pages.

**Effort:** 2 hours. No JS changes.

**Files:** index.html (CSS + elements), scorekeeper.html (CSS + elements)

### R2: Custom baseball icon family

**Verdict: Defer.** High effort, low functional impact. The product works without it. Revisit when the functional gaps (toast, validation, visited toggle) are closed.

If pursued later, the 6 icons named in the review are the right set:
1. Ballpark marker (for park cards and route)
2. Route badge (for the route preview section)
3. Inning marker (for the score table headers)
4. Line score glyph (for the play log entries)
5. Lineup symbol (for the lineup editor headers)
6. Scorebook notation accents (for play event labels)

**Format:** Inline SVG with `currentColor` fill so they inherit theme colors. No icon font, no external library.

**Effort:** 1-2 days of design work + 1 day of integration.

### R3: Push scorekeeper scorebook to focal position

**Verdict: Do it, but scoped.** The scorebook (score table) should be visually dominant. Supporting controls (lineup editor, play input, play log) should be clearly subordinate.

**Implementation:**
- Increase score table font size by 1 step (from `var(--type-body)` to `var(--type-subhead)`)
- Add a subtle background treatment to the scorebook section (light cream card with stronger shadow)
- Reduce visual weight of lineup editor and play input sections (lower contrast, smaller type)
- Make the scorebook section stick to viewport on scroll (sticky within its container, not fixed)
- Add the display serif (R1) to the scoreboard title

**Effort:** 3-4 hours. CSS + minor HTML restructuring.

**Files:** scorekeeper.html

### R4: Refine dense utility zones

**Verdict: Agree, but low priority.** The "utility zones" are: game setup form, lineup editor inputs, toolbar buttons. These work. They're clear. They're just not as polished as the hero and scorebook.

**Implementation:**
- Add subtle rounded card treatment to the setup section (matching scorebook style)
- Increase input field height from 40px to 44px (also fixes touch target audit finding S3-15)
- Add a section divider pattern between setup → controls → log (currently relies on spacing only)

**Effort:** 1-2 hours. CSS only.

### R5: Per-theme texture language

**Verdict: Interesting but defer.** The current theme system does color + wash + stripe. Adding per-theme geometry (stitch patterns, field markings, leather texture) would be distinctive but is a design investment beyond the current scope.

**If pursued:** Define 1-2 CSS custom properties per theme for `--texture-pattern` (SVG data URI) and `--texture-opacity`. Apply to hero backgrounds and scorebook containers. Keep subtle (opacity 0.02-0.04).

**Effort:** 1 day per theme × 5 themes = 5 days. Defer.

### R6: Tactile scoring feedback

**Verdict: Do it, scoped to 3 moments.** The review asks for "more deliberate" feedback, not more animation. Three moments matter:

1. **Play logged:** Brief scale pulse on the event button (60ms scale 0.95 → 1.0) + score table row highlight flash (200ms gold background fade)
2. **Inning change:** Score table column header briefly highlights (300ms accent border bottom)
3. **Game finalized:** Scoreboard gets a subtle "sealed" treatment (gold top border, slightly elevated shadow)

**Implementation:**
```css
@keyframes play-pulse { 0% { transform: scale(0.95); } 100% { transform: scale(1); } }
.event-btn:active { animation: play-pulse 60ms ease-out; }
.score-row.just-scored { animation: score-flash 200ms ease-out; }
@keyframes score-flash { from { background: rgba(var(--accent-rgb), 0.12); } to { background: transparent; } }
```

Respect `prefers-reduced-motion` — disable all three under that media query.

**Effort:** 2 hours. CSS + minor JS (add/remove `.just-scored` class after play).

**Files:** scorekeeper.html

### R7: Tighten copy tone

**Verdict: Agree.** Some sections have warm, inviting copy ("Score your first game to start building your ballpark collection"). Others are flat operational prose ("The log doubles as the audit trail for undo and JSON export"). The review is right that every surface should sound like the same voice.

**Implementation:** Audit pass on all user-facing text. Rewrite:
- Section kickers (short, warm, aspirational)
- Empty states (inviting, action-oriented)
- Toolbar labels (clear but not clinical)
- Footer text (brand-consistent sign-off)

**Effort:** 1-2 hours. Text-only changes.

**Files:** index.html, scorekeeper.html

### R8: Treat scorekeeper as craft, not tool

**Verdict: This is R1 + R3 + R6 combined.** The review is saying: the scorekeeper should feel like a leather-bound scorebook, not a web form. That means:
- Display serif on headers (R1)
- Scorebook as visual focal point (R3)
- Tactile feedback on scoring moments (R6)
- Warmer copy tone (R7)

No additional implementation beyond those four.

---

## Prioritized Design Pass

Based on the review + UX audit, here's the order:

| Priority | Item | Source | Effort | Impact |
|----------|------|--------|--------|--------|
| 1 | Display serif font | R1 | 2 hours | Highest — transforms the typographic voice |
| 2 | Scorebook elevation | R3 | 3-4 hours | Makes the scorekeeper feel like the main event |
| 3 | Scoring micro-feedback | R6 | 2 hours | Tactile satisfaction on the core action |
| 4 | Copy tone pass | R7 | 1-2 hours | Consistency across all surfaces |
| 5 | Utility zone refinement | R4 | 1-2 hours | Polish on secondary surfaces |
| 6 | Custom icon family | R2 | 2-3 days | Deferred — high effort, optional |
| 7 | Per-theme textures | R5 | 5 days | Deferred — nice-to-have |

**Items 1-5 are a single focused day of work.** Items 6-7 are future polish.

---

## Cross-Reference: Design Review vs UX Audit

| Design Review Says | UX Audit Says | Resolution |
|---|---|---|
| "Needs display type" | (Not covered) | Add display serif — R1 |
| "Needs icon family" | (Not covered) | Defer — R2 |
| "Scorebook needs elevation" | (Not covered) | Do it — R3 |
| "Dense zones need polish" | "Lineup guidance unclear" (S3-15) | Fix both — R4 + D4 |
| (Not covered) | "Reset has no confirmation" (S1-1) | Fix — Batch A |
| (Not covered) | "No toast system" (S1-2) | Fix — Batch A |
| (Not covered) | "Import has no validation" (S1-3) | Fix — Batch A |
| (Not covered) | "No mark-as-visited" (S2-5) | Fix — Batch C |
| "More tactile scoring" | (Not covered) | Do it — R6 |
| "Tighten copy tone" | "Lineup guidance unclear" (S3-15) | Fix both — R7 + D4 |
| "Restraint is working" | "Touch targets meet 44px" | Confirmed — no change needed |
| "Palette is excellent" | "Tier colors hardcoded" (S3-14) | Move to theme tokens — D3 |

**The review and audit are complementary.** The review addresses the top of the design pyramid (emotion, identity, craft). The audit addresses the base (safety, feedback, accessibility). Both need to be executed. The audit items come first because broken plumbing undermines beautiful design.
