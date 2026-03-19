#!/usr/bin/env node
/**
 * build-schedule.js
 * Reads schedule-export.json, merges with existing Notion-sourced parks
 * (yankee-stadium, progressive-field, citizens-bank-park), and rewrites
 * schedule.js with all parks.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EXPORT_PATH = path.join(__dirname, "schedule-export.json");
const SCHEDULE_JS = path.join(ROOT, "schedule.js");

/* ── team-name → park-id ── */
const TEAM_TO_PARK = {
  "New York Yankees":        "yankee-stadium",
  "Cleveland Guardians":     "progressive-field",
  "Philadelphia Phillies":   "citizens-bank-park",
  "Boston Red Sox":          "fenway-park",
  "Baltimore Orioles":       "camden-yards",
  "Toronto Blue Jays":       "rogers-centre",
  "Tampa Bay Rays":          "tropicana-field",
  "Chicago White Sox":       "guaranteed-rate-field",
  "Minnesota Twins":         "target-field",
  "Detroit Tigers":          "comerica-park",
  "Kansas City Royals":      "kauffman-stadium",
  "Houston Astros":          "minute-maid-park",
  "Los Angeles Angels":      "angel-stadium",
  "Seattle Mariners":        "t-mobile-park",
  "Texas Rangers":           "globe-life-field",
  "Athletics":               "sutter-health-park",
};

/* Park IDs whose data comes from Notion (preserve as-is from schedule.js) */
const NOTION_PARKS = new Set([
  "yankee-stadium",
  "progressive-field",
  "citizens-bank-park"
]);

/* Special event dates */
const SPECIAL_EVENTS = {
  "2026-04-15": "Jackie Robinson Day",
  "2026-06-02": "Lou Gehrig Day",
  "2026-09-15": "Roberto Clemente Day",
};

/* Pretty park-name labels for comments */
const PARK_LABELS = {
  "yankee-stadium":         "Yankee Stadium",
  "progressive-field":      "Progressive Field",
  "citizens-bank-park":     "Citizens Bank Park",
  "fenway-park":            "Fenway Park",
  "camden-yards":           "Camden Yards",
  "rogers-centre":          "Rogers Centre",
  "tropicana-field":        "Tropicana Field",
  "guaranteed-rate-field":  "Guaranteed Rate Field",
  "target-field":           "Target Field",
  "comerica-park":          "Comerica Park",
  "kauffman-stadium":       "Kauffman Stadium",
  "minute-maid-park":       "Minute Maid Park",
  "angel-stadium":          "Angel Stadium",
  "t-mobile-park":          "T-Mobile Park",
  "globe-life-field":       "Globe Life Field",
  "sutter-health-park":     "Sutter Health Park",
};

// ─── 1. Read existing schedule.js and extract Notion-sourced park data ───

const existingJS = fs.readFileSync(SCHEDULE_JS, "utf8");

function extractParkArray(js, parkId) {
  // Find "park-id": [ ... ] in the JS source
  const startMarker = `"${parkId}": [`;
  const idx = js.indexOf(startMarker);
  if (idx === -1) return null;

  // Find matching closing bracket
  let depth = 0;
  let start = js.indexOf("[", idx);
  for (let i = start; i < js.length; i++) {
    if (js[i] === "[") depth++;
    if (js[i] === "]") depth--;
    if (depth === 0) {
      const raw = js.substring(start, i + 1);
      // Convert JS object notation to JSON: {d:"..." ...} → {"d":"..." ...}
      const jsonified = raw
        .replace(/(\{)\s*d:/g, '{"d":')
        .replace(/,\s*y:/g, ',"y":')
        .replace(/,\s*t:/g, ',"t":')
        .replace(/,\s*o:/g, ',"o":')
        .replace(/,\s*s:/g, ',"s":')
        .replace(/,\s*h:/g, ',"h":');
      try {
        return JSON.parse(jsonified);
      } catch (e) {
        console.error(`Failed to parse ${parkId}:`, e.message);
        return null;
      }
    }
  }
  return null;
}

// Extract preserved Notion parks
const notionData = {};
for (const parkId of NOTION_PARKS) {
  const arr = extractParkArray(existingJS, parkId);
  if (arr) {
    notionData[parkId] = arr;
    console.log(`  Preserved ${parkId}: ${arr.length} games (Notion-sourced)`);
  }
}

// ─── 2. Read JSON export and group by park ───

const exportData = JSON.parse(fs.readFileSync(EXPORT_PATH, "utf8"));
const exportByPark = {};

for (const game of exportData.games) {
  const parkId = TEAM_TO_PARK[game.team];
  if (!parkId) {
    console.warn(`  Unknown team: ${game.team}`);
    continue;
  }
  // Skip Notion-sourced parks
  if (NOTION_PARKS.has(parkId)) continue;

  if (!exportByPark[parkId]) exportByPark[parkId] = [];

  const special = SPECIAL_EVENTS[game.date] || "";
  exportByPark[parkId].push({
    d: game.date,
    y: game.day,
    t: game.time,
    o: game.opponent,
    s: special,
    h: false,
  });
}

// Sort each park's games by date
for (const parkId of Object.keys(exportByPark)) {
  exportByPark[parkId].sort((a, b) => a.d.localeCompare(b.d));
  console.log(`  Imported ${parkId}: ${exportByPark[parkId].length} games`);
}

// ─── 3. Merge: Notion parks first, then export parks ───

const allParks = {};

// Desired order: existing Notion parks first, then new parks alphabetically
const notionOrder = ["yankee-stadium", "progressive-field", "citizens-bank-park"];
for (const parkId of notionOrder) {
  if (notionData[parkId]) {
    allParks[parkId] = notionData[parkId];
  }
}

// Add export parks in alphabetical order
const exportParkIds = Object.keys(exportByPark).sort();
for (const parkId of exportParkIds) {
  allParks[parkId] = exportByPark[parkId];
}

// ─── 4. Generate new schedule.js ───

function gameToJS(game, indent) {
  const d = JSON.stringify(game.d);
  const y = JSON.stringify(game.y);
  const t = JSON.stringify(game.t);
  const o = JSON.stringify(game.o);
  const s = JSON.stringify(game.s || "");
  const h = game.h ? "true" : "false";
  return `${indent}{d:${d},y:${y},t:${t},o:${o},s:${s},h:${h}}`;
}

function generateScheduleBlock(parks) {
  const lines = [];
  const parkIds = Object.keys(parks);

  for (let p = 0; p < parkIds.length; p++) {
    const parkId = parkIds[p];
    const games = parks[parkId];
    const label = PARK_LABELS[parkId] || parkId;

    lines.push("");
    lines.push(`    /* ─── ${label} ─── */`);
    lines.push(`    "${parkId}": [`);

    for (let i = 0; i < games.length; i++) {
      const comma = i < games.length - 1 ? "," : "";
      lines.push(`      ${gameToJS(games[i], "").trim()}${comma}`);
    }

    const parkComma = p < parkIds.length - 1 ? "," : "";
    lines.push(`    ]${parkComma}`);
  }

  return lines.join("\n");
}

// Read the template parts from existing schedule.js
const scheduleStart = existingJS.indexOf("var SCHEDULE_2026 = {");
const scheduleEnd = existingJS.indexOf("};", scheduleStart) + 2;

const before = existingJS.substring(0, scheduleStart);
const after = existingJS.substring(scheduleEnd);

const scheduleBlock = generateScheduleBlock(allParks);

const newJS = before +
  "var SCHEDULE_2026 = {" +
  scheduleBlock + "\n" +
  "  };" +
  after;

fs.writeFileSync(SCHEDULE_JS, newJS, "utf8");

// ─── Summary ───
let totalGames = 0;
let totalParks = 0;
for (const parkId of Object.keys(allParks)) {
  totalGames += allParks[parkId].length;
  totalParks++;
}
console.log(`\n  Done! ${totalParks} parks, ${totalGames} total games written to schedule.js`);
