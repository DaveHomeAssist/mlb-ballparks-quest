# MLB Ballparks Quest Scorecard V2 Contract

## Goal

Turn the current scorekeeper from a replay based game logger into a real baseball scorecard engine without losing static hosting, local first persistence, or the current fast chip workflow.

## Core Rules

1. Structured scoring data is the source of truth
2. Canvas is a render target, not the canonical record
3. A batter box stays open until the runner scores, is retired, or is stranded
4. A single play may update multiple boxes at once
5. All input modes create scoring intents that flow through one commit path

## Canonical Model

```js
ScorecardGame {
  schemaVersion: 2,
  teams: { away: Team, home: Team },
  innings: Inning[],
  plays: Play[],
  runners: Runner[],
  liveState: LiveState,
  inputMode: 'chip' | 'code' | 'pencil'
}

Team {
  lineup: Batter[9],
  pitchers: PitcherAppearance[]
}

Inning {
  number: number,
  top: HalfInning,
  bottom: HalfInning
}

HalfInning {
  outs: 0 | 1 | 2 | 3,
  playIds: string[],
  battingAround: boolean
}

Batter {
  slot: number,
  name: string,
  number: string,
  position: string,
  cellsByInning: Record<number, Cell[]>
}

Cell {
  cellRef: {
    teamSide: 'away' | 'home',
    batterSlot: number,
    inningNumber: number,
    cellIndex: number
  },
  plateAppearance: PaResult | null,
  advances: Advance[],
  runScored: boolean,
  runScoredBy: { playId: string, batterSlot: number, code: string } | null,
  putOutOnBases: { atBase: 1 | 2 | 3 | 4, fieldingCode: string, playId: string } | null,
  outNumber: 1 | 2 | 3 | null,
  isInningEndSlash: boolean,
  isStranded: boolean,
  errorImpact: boolean
}

Runner {
  runnerId: string,
  teamSide: 'away' | 'home',
  originCellRef: {
    teamSide: 'away' | 'home',
    batterSlot: number,
    inningNumber: number,
    cellIndex: number
  },
  currentBase: 1 | 2 | 3,
  status: 'active' | 'scored' | 'out' | 'stranded',
  resolutionPlayId: string | null
}

Play {
  id: string,
  inningNumber: number,
  half: 'top' | 'bottom',
  batterSlot: number,
  batterName: string,
  eventCode: string,
  fieldingCode: string | null,
  createdRunners: string[],
  affectedRunners: string[],
  outsOnPlay: number,
  runsOnPlay: number
}

LiveState {
  inningNumber: number,
  half: 'top' | 'bottom',
  outs: number,
  batterIndex: { away: number, home: number },
  activeRunners: Runner[]
}
```

## Why The Model Is Shaped This Way

1. `plays[]` preserves temporal order for earned run logic, inning endings, and force logic
2. `runners[]` preserves long lived baserunner state across later plays
3. `originCellRef` gives every runner a stable path back to the original batter box
4. `cellsByInning[number] = Cell[]` allows batting around without breaking the grid
5. `pitchers[]` is reserved now so pitcher tracking can land later without restructuring

## Scoring Intent Layer

Every input path must create one of these intents:

```js
ScoringIntent =
  | { type: 'plate_appearance', eventCode: string, fieldingCode?: string | null }
  | { type: 'runner_advance', runnerId: string, toBase: 2 | 3 | 4, via: string }
  | { type: 'runner_out', runnerId: string, atBase: 1 | 2 | 3 | 4, fieldingCode: string }
  | { type: 'runner_scored', runnerId: string, playId: string, batterSlot: number, code: string }
  | { type: 'inning_end', playId: string, outNumber: 1 | 2 | 3 }
  | { type: 'substitution', side: 'away' | 'home', kind: 'PH' | 'PR' | 'DEF', slot: number, player: PlayerStub }
```

One helper owns mutation:

```js
commitScoringIntent(intent, gameState)
```

## Cell Lifecycle Rules

### Phase 1
Plate appearance closes the batter's time at the plate and may create a runner

### Phase 2
If the batter reaches base, later plays update the same origin box as the runner advances

### Phase 3
Runner resolves in one of three ways:

1. scores
2. retired on base
3. stranded at inning end

The cell is not fully resolved until one of those outcomes is written.

## Concurrent Box Update Rules

One play may update:

1. the current batter box
2. one or more older runner boxes
3. the inning ending slash on the final out box

That is why runners are first class records and not implied from the batter only.

## Migration From The Current Scorekeeper

### Current truth

1. `game.plays[]`
2. `game.state`
3. `game.lineups`

### V2 migration steps

1. Ensure each existing play has a stable `id`
2. Build `teams.away.lineup` and `teams.home.lineup` from current lineups
3. Build `innings[]` from current play order
4. Build `cellsByInning` using each play's `batterSlot`, `inning`, and batting side
5. Build `runners[]` from play outcomes and baserunner transitions
6. Build `liveState.activeRunners` from the last half inning state

### Compatibility rule

Old games remain loadable. If `scorecardV2` is absent, build it lazily on load and keep the current replay engine as a validation path until the v2 scorer fully replaces it.

## Current Phase 1 Scope

1. Add `scorecardV2` scaffold to every game object
2. Add play ids where missing
3. Build lineup and inning placeholders
4. Mirror current live inning state into `scorecardV2.liveState`
5. Keep the existing scorer as the active mutation engine for now

## Deferred From Phase 1

1. true runner lifecycle mutation
2. pitcher ledger
3. batting around multi cell expansion
4. canvas cell renderer
5. Pencil interpretation

## Acceptance For Phase 1

1. New games contain a valid `scorecardV2` object
2. Old games migrate on load without breaking
3. Exported JSON includes the scaffold
4. Current logging, import, undo, and export still work
