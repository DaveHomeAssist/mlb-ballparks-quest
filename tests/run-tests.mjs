#!/usr/bin/env node
/* tests/run-tests.mjs — MLB Ballparks Quest automated test suite.
   Zero dependencies by design (repo rule: no npm, no build tooling).
   Run locally or in CI with: node tests/run-tests.mjs

   Covers: JS syntax across every shipped script, 2026 schedule data
   integrity, resolver scorekeeping rules, the storage wrapper, and
   ICS calendar export (Eastern-to-UTC contract, TBD handling). */

import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log("ok   " + name);
  } catch (err) {
    failures.push({ name, err });
    console.error("FAIL " + name + "\n     " + (err && err.message ? err.message : err));
  }
}

/* ── 1. Syntax: every shipped script must parse ────────────────── */

const rootScripts = readdirSync(ROOT)
  .filter((name) => name.endsWith(".js"))
  .map((name) => name);
const sharedScripts = readdirSync(path.join(ROOT, "shared/js/core"))
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join("shared/js/core", name));

for (const rel of [...rootScripts, ...sharedScripts]) {
  test("syntax: " + rel, () => {
    execFileSync(process.execPath, ["--check", path.join(ROOT, rel)], { stdio: "pipe" });
  });
}

/* ── module loader: browser IIFEs in a sandboxed window ────────── */

function createAppSandbox() {
  const store = new Map();
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
      setItem: (key, value) => { store.set(String(key), String(value)); },
      removeItem: (key) => { store.delete(String(key)); }
    },
    navigator: {},
    __store: store
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  // Mirrors the index.html load order (minus DOM-only modules).
  const LOAD_ORDER = [
    "shared/js/core/config.js",
    "config.js",
    "shared/js/core/storage.js",
    "storage.js",
    "shared/js/core/utils.js",
    "utils.js",
    "data.js",
    "schedule.js",
    "resolver.js",
    "app.js"
  ];
  for (const rel of LOAD_ORDER) {
    vm.runInContext(readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
  }
  return sandbox;
}

let BPQ = null;
test("modules load in load order without a DOM", () => {
  const sandbox = createAppSandbox();
  BPQ = sandbox.BPQ;
  assert.ok(BPQ, "BPQ namespace missing");
  for (const mod of ["storage", "data", "utils", "schedule", "resolver", "app"]) {
    assert.ok(BPQ[mod], "BPQ." + mod + " missing");
  }
});

if (!BPQ) {
  report();
}

/* ── 2. Schedule data integrity ────────────────────────────────── */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_RE = /^\d{1,2}:\d{2} (AM|PM)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

test("schedule covers all 30 parks with plausible home-game counts", () => {
  const schedule = BPQ.schedule;
  const parkIds = Object.values(schedule.TEAM_TO_PARK);
  assert.equal(parkIds.length, 30, "expected 30 team→park mappings");
  assert.equal(schedule.getTeamCount(), 30, "expected schedule data for 30 parks");

  const knownParkIds = new Set(BPQ.data.getParks().map((park) => park.id));
  let total = 0;
  for (const parkId of parkIds) {
    assert.ok(knownParkIds.has(parkId), "unknown park id in schedule: " + parkId);
    const games = schedule.getGamesForPark(parkId);
    assert.ok(games.length >= 70 && games.length <= 90,
      parkId + " has implausible home-game count " + games.length);
    total += games.length;
  }
  assert.ok(total >= 2300 && total <= 2600, "implausible season total " + total);
});

test("every schedule entry has a valid date, weekday, time, and opponent", () => {
  const schedule = BPQ.schedule;
  const teamNames = new Set(Object.keys(schedule.TEAM_TO_PARK));
  const seenIds = new Set();

  for (const [teamName, parkId] of Object.entries(schedule.TEAM_TO_PARK)) {
    for (const game of schedule.getGamesForPark(parkId)) {
      const label = parkId + " " + game.d + " vs " + game.o;
      assert.match(game.d, DATE_RE, label + ": bad date");
      const date = new Date(game.d + "T00:00:00Z");
      assert.ok(Number.isFinite(date.getTime()), label + ": unreal date");
      assert.equal(date.toISOString().slice(0, 10), game.d, label + ": unreal calendar date");
      assert.equal(WEEKDAYS[date.getUTCDay()], game.y, label + ": weekday mismatch");
      assert.ok(game.t === "TBD" || TIME_RE.test(game.t), label + ": bad time \"" + game.t + "\"");
      assert.ok(teamNames.has(game.o), label + ": unknown opponent");
      assert.notEqual(game.o, teamName, label + ": team hosting itself");
      if (game.n !== undefined) {
        assert.ok(Number.isInteger(game.n) && game.n >= 2, label + ": bad doubleheader index");
      }
      const id = schedule.getGameId(parkId, game);
      assert.ok(id && !seenIds.has(id), label + ": duplicate game id " + id);
      seenIds.add(id);
    }
  }
});

/* ── 3. Resolver scorekeeping rules ────────────────────────────── */

function runner(id) {
  return { id, batterId: id, reachedOn: "test", reachedInning: 1, cellRef: null };
}

function loadedBases() {
  return { first: runner("r1"), second: runner("r2"), third: runner("r3") };
}

test("resolver: grand slam clears the bases and scores four", () => {
  const result = BPQ.resolver.resolvePlay("HR", { bases: loadedBases() }, runner("batter"));
  assert.equal(result.runsScored, 4);
  assert.equal(result.outsAdded, 0);
  assert.deepEqual(
    [result.bases.first, result.bases.second, result.bases.third],
    [null, null, null]
  );
});

test("resolver: bases-loaded walk forces in exactly one run", () => {
  const result = BPQ.resolver.resolvePlay("BB", { bases: loadedBases() }, runner("batter"));
  assert.equal(result.runsScored, 1);
  assert.equal(result.outsAdded, 0);
  assert.equal(result.bases.first.id, "batter");
  assert.equal(result.bases.second.id, "r1");
  assert.equal(result.bases.third.id, "r2");
});

test("resolver: strikeout adds one out and leaves runners", () => {
  const result = BPQ.resolver.resolvePlay("K", { bases: loadedBases() }, runner("batter"));
  assert.equal(result.runsScored, 0);
  assert.equal(result.outsAdded, 1);
  assert.equal(result.bases.first.id, "r1");
  assert.equal(result.bases.third.id, "r3");
});

test("resolver: double play adds two outs", () => {
  const bases = { first: runner("r1"), second: null, third: null };
  const result = BPQ.resolver.resolvePlay("DP", { bases }, runner("batter"));
  assert.equal(result.outsAdded, 2);
  assert.equal(result.bases.first, null);
});

test("resolver: sac fly scores the runner from third with one out", () => {
  const bases = { first: null, second: null, third: runner("r3") };
  const result = BPQ.resolver.resolvePlay("SF", { bases }, runner("batter"));
  assert.equal(result.runsScored, 1);
  assert.equal(result.outsAdded, 1);
  assert.equal(result.bases.third, null);
});

test("resolver: scorekeeper shorthand normalizes to play codes", () => {
  assert.equal(BPQ.resolver.normalizeScorekeeperCode("6-3"), "GO");
  assert.equal(BPQ.resolver.normalizeScorekeeperCode("f8"), "FO");
  assert.equal(BPQ.resolver.normalizeScorekeeperCode("E5"), "E");
  assert.equal(BPQ.resolver.normalizeScorekeeperCode("hr"), "HR");
  assert.equal(BPQ.resolver.normalizeScorekeeperCode("??"), null);
});

/* ── 4. Storage wrapper ────────────────────────────────────────── */

test("storage: write, flush, read, and remove round-trip", () => {
  const storage = BPQ.createStorage({ namespace: "bpq.test", debounceMs: 50 });
  storage.set("probe", { visited: ["pnc-park"] });
  assert.ok(storage.hasPendingWrite("probe"), "write should debounce");
  storage.flush("probe");
  assert.ok(!storage.hasPendingWrite("probe"), "flush should clear pending write");
  assert.equal(
    JSON.stringify(storage.get("probe", null)),
    JSON.stringify({ visited: ["pnc-park"] })
  );
  storage.update("probe", (value) => {
    value.visited.push("fenway-park");
    return value;
  });
  storage.flush("probe");
  assert.equal(
    JSON.stringify(storage.get("probe", null).visited),
    JSON.stringify(["pnc-park", "fenway-park"])
  );
  storage.remove("probe");
  assert.equal(storage.get("probe", "gone"), "gone");
});

/* ── 5. ICS calendar export (M-3 time-zone contract) ───────────── */

test("ICS: Eastern evening start exports the exact UTC instant (EDT)", () => {
  const ics = BPQ.app.buildGameICS({
    d: "2026-07-10", t: "7:05 PM",
    awayTeam: "New York Mets", homeTeam: "Philadelphia Phillies",
    gameId: "test-edt", venue: "Citizens Bank Park"
  });
  assert.match(ics, /DTSTART:20260710T230500Z/, "7:05 PM EDT must be 23:05 UTC");
  assert.match(ics, /DTEND:20260711T020500Z/, "end must be start + 3h");
  assert.match(ics, /SUMMARY:New York Mets at Philadelphia Phillies/);
});

test("ICS: Eastern start exports the exact UTC instant (EST)", () => {
  const ics = BPQ.app.buildGameICS({
    d: "2026-01-15", t: "7:00 PM",
    awayTeam: "Away", homeTeam: "Home", gameId: "test-est"
  });
  assert.match(ics, /DTSTART:20260116T000000Z/, "7:00 PM EST must be 00:00 UTC next day");
});

test("ICS: TBD start becomes a date-only reminder, never an invented time", () => {
  const ics = BPQ.app.buildGameICS({
    d: "2026-04-30", t: "TBD",
    awayTeam: "Houston Astros", homeTeam: "Home", gameId: "test-tbd"
  });
  assert.match(ics, /DTSTART;VALUE=DATE:20260430/);
  assert.match(ics, /DTEND;VALUE=DATE:20260501/);
  assert.match(ics, /SUMMARY:.*\(start time TBD\)/);
  assert.doesNotMatch(ics, /190500/, "must not invent a 7:05 PM start");
});

test("ICS: a real schedule game round-trips through getGameById", () => {
  const schedule = BPQ.schedule;
  let sampleId = null;
  for (const parkId of Object.values(schedule.TEAM_TO_PARK)) {
    const games = schedule.getGamesForPark(parkId);
    if (games.length) {
      sampleId = schedule.getGameId(parkId, games[0]);
      break;
    }
  }
  assert.ok(sampleId, "no schedule game found");
  const game = BPQ.app.getGameById(sampleId);
  assert.ok(game, "getGameById returned nothing");
  const ics = BPQ.app.buildGameICS(game);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART/);
  assert.match(ics, /END:VCALENDAR/);
});

/* ── report ────────────────────────────────────────────────────── */

function report() {
  console.log("\n" + passed + " passed, " + failures.length + " failed");
  process.exit(failures.length ? 1 : 0);
}

report();
