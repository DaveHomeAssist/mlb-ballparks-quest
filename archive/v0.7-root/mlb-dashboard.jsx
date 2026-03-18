import { useState, useCallback, useMemo } from "react";

// ─── BALLPARK DATABASE ───────────────────────────────────────────────
const PARKS = [
  { id: 1, team: "Arizona Diamondbacks", stadium: "Chase Field", city: "Phoenix, AZ", capacity: 48519, roof: "Retractable", surface: "Artificial", opened: 1998, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 2, team: "Atlanta Braves", stadium: "Truist Park", city: "Cumberland, GA", capacity: 41084, roof: "Open", surface: "Grass", opened: 2017, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 3, team: "Baltimore Orioles", stadium: "Oriole Park at Camden Yards", city: "Baltimore, MD", capacity: 44970, roof: "Open", surface: "Grass", opened: 1992, tier: "S", visited: true, visitDate: "2023-07-15", rating: 5, notes: "Iconic retro-classic. B&O Warehouse beyond right field is unforgettable.", bestFeature: "B&O Warehouse backdrop" },
  { id: 4, team: "Boston Red Sox", stadium: "Fenway Park", city: "Boston, MA", capacity: 37755, roof: "Open", surface: "Grass", opened: 1912, tier: "S", visited: true, visitDate: "2022-08-20", rating: 5, notes: "The Green Monster is even more impressive in person. Cramped but magical.", bestFeature: "Green Monster" },
  { id: 5, team: "Chicago Cubs", stadium: "Wrigley Field", city: "Chicago, IL", capacity: 41649, roof: "Open", surface: "Grass", opened: 1914, tier: "S", visited: true, visitDate: "2023-05-12", rating: 5, notes: "Ivy walls, rooftop bleachers across the street. Pure baseball history.", bestFeature: "Ivy-covered outfield walls" },
  { id: 6, team: "Chicago White Sox", stadium: "Guaranteed Rate Field", city: "Chicago, IL", capacity: 40615, roof: "Open", surface: "Grass", opened: 1991, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 7, team: "Cincinnati Reds", stadium: "Great American Ball Park", city: "Cincinnati, OH", capacity: 42319, roof: "Open", surface: "Grass", opened: 2003, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 8, team: "Cleveland Guardians", stadium: "Progressive Field", city: "Cleveland, OH", capacity: 34830, roof: "Open", surface: "Grass", opened: 1994, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 9, team: "Colorado Rockies", stadium: "Coors Field", city: "Denver, CO", capacity: 50144, roof: "Open", surface: "Grass", opened: 1995, tier: "A", visited: true, visitDate: "2023-09-03", rating: 4, notes: "Mile High air affects every fly ball. Great views of the Rockies beyond LF.", bestFeature: "Mountain views" },
  { id: 10, team: "Detroit Tigers", stadium: "Comerica Park", city: "Detroit, MI", capacity: 41083, roof: "Open", surface: "Grass", opened: 2000, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 11, team: "Houston Astros", stadium: "Minute Maid Park", city: "Houston, TX", capacity: 41168, roof: "Retractable", surface: "Grass", opened: 2000, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 12, team: "Kansas City Royals", stadium: "Kauffman Stadium", city: "Kansas City, MO", capacity: 37903, roof: "Open", surface: "Grass", opened: 1973, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 13, team: "Los Angeles Angels", stadium: "Angel Stadium", city: "Anaheim, CA", capacity: 45517, roof: "Open", surface: "Grass", opened: 1966, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 14, team: "Los Angeles Dodgers", stadium: "Dodger Stadium", city: "Los Angeles, CA", capacity: 56000, roof: "Open", surface: "Grass", opened: 1962, tier: "A", visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 15, team: "Miami Marlins", stadium: "loanDepot park", city: "Miami, FL", capacity: 36742, roof: "Retractable", surface: "Artificial", opened: 2012, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 16, team: "Milwaukee Brewers", stadium: "American Family Field", city: "Milwaukee, WI", capacity: 41900, roof: "Retractable", surface: "Grass", opened: 2001, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 17, team: "Minnesota Twins", stadium: "Target Field", city: "Minneapolis, MN", capacity: 38544, roof: "Open", surface: "Grass", opened: 2010, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 18, team: "New York Mets", stadium: "Citi Field", city: "New York, NY", capacity: 41922, roof: "Open", surface: "Grass", opened: 2009, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 19, team: "New York Yankees", stadium: "Yankee Stadium", city: "New York, NY", capacity: 54251, roof: "Open", surface: "Grass", opened: 2009, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 20, team: "Oakland Athletics", stadium: "Sutter Health Park", city: "Sacramento, CA", capacity: 14014, roof: "Open", surface: "Grass", opened: 1999, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 21, team: "Philadelphia Phillies", stadium: "Citizens Bank Park", city: "Philadelphia, PA", capacity: 42792, roof: "Open", surface: "Grass", opened: 2004, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 22, team: "Pittsburgh Pirates", stadium: "PNC Park", city: "Pittsburgh, PA", capacity: 38747, roof: "Open", surface: "Grass", opened: 2001, tier: "S", visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 23, team: "San Diego Padres", stadium: "Petco Park", city: "San Diego, CA", capacity: 40162, roof: "Open", surface: "Grass", opened: 2004, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 24, team: "San Francisco Giants", stadium: "Oracle Park", city: "San Francisco, CA", capacity: 41915, roof: "Open", surface: "Grass", opened: 2000, tier: "A", visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 25, team: "Seattle Mariners", stadium: "T-Mobile Park", city: "Seattle, WA", capacity: 47929, roof: "Retractable", surface: "Artificial", opened: 1999, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 26, team: "St. Louis Cardinals", stadium: "Busch Stadium", city: "St. Louis, MO", capacity: 44494, roof: "Open", surface: "Grass", opened: 2006, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 27, team: "Tampa Bay Rays", stadium: "Tropicana Field", city: "St. Petersburg, FL", capacity: 25000, roof: "Fixed", surface: "Artificial", opened: 1990, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 28, team: "Texas Rangers", stadium: "Globe Life Field", city: "Arlington, TX", capacity: 40518, roof: "Retractable", surface: "Artificial", opened: 2020, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 29, team: "Toronto Blue Jays", stadium: "Rogers Centre", city: "Toronto, ON", capacity: 49282, roof: "Retractable", surface: "Artificial", opened: 1989, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
  { id: 30, team: "Washington Nationals", stadium: "Nationals Park", city: "Washington, DC", capacity: 41313, roof: "Open", surface: "Grass", opened: 2008, tier: null, visited: false, visitDate: null, rating: null, notes: "", bestFeature: "" },
];

const TIERS = { S: { label: "S", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" }, A: { label: "A", color: "#34d399", bg: "rgba(52,211,153,0.15)" }, B: { label: "B", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" }, C: { label: "C", color: "#a78bfa", bg: "rgba(167,139,250,0.15)" } };

const MILESTONES = [
  { title: "Database backbone complete", done: "All 30 parks populated for mapping", target: "March 2026", status: "in-progress" },
  { title: "First roadtrip plan locked", done: "Next 3 parks chosen, dates penciled, route sketched", target: "TBD", status: "not-started" },
  { title: "Visited workflow proven", done: "At least 3 parks logged with notes + rating", target: "TBD", status: "not-started" },
  { title: "Game scorer v0", done: "Play loop working end-to-end with correct out/inning progression", target: "TBD", status: "not-started" },
];

const NEXT_TARGETS = [22, 19, 14]; // PNC Park, Yankee Stadium, Dodger Stadium

// ─── GAME SCORER: DATA MODEL ────────────────────────────────────────
// Event types and their default out values
const EVENTS = {
  "1B":  { label: "1B",  outs: 0, isHit: true,  autoCommit: false },
  "2B":  { label: "2B",  outs: 0, isHit: true,  autoCommit: false },
  "3B":  { label: "3B",  outs: 0, isHit: true,  autoCommit: false },
  "HR":  { label: "HR",  outs: 0, isHit: true,  autoCommit: true  },
  "BB":  { label: "BB",  outs: 0, isHit: false, autoCommit: true  },
  "HBP": { label: "HBP", outs: 0, isHit: false, autoCommit: true  },
  "K":   { label: "K",   outs: 1, isHit: false, autoCommit: true  },
  "OUT": { label: "OUT", outs: 1, isHit: false, autoCommit: true  },
  "FO":  { label: "FO",  outs: 1, isHit: false, autoCommit: true  },
  "FC":  { label: "FC",  outs: 1, isHit: false, autoCommit: false },
  "DP":  { label: "DP",  outs: 2, isHit: false, autoCommit: false },
  "E":   { label: "E",   outs: 0, isHit: false, autoCommit: false },
  "SAC": { label: "SAC", outs: 1, isHit: false, autoCommit: false },
};

const EMPTY_BASES = { first: null, second: null, third: null };

const createDefaultLineup = (teamName) =>
  Array.from({ length: 9 }, (_, i) => ({
    id: `${teamName}-${i + 1}`,
    name: `${teamName} #${i + 1}`,
    number: i + 1,
  }));

const createNewGame = (awayName = "Away", homeName = "Home") => ({
  away: { name: awayName, lineup: createDefaultLineup(awayName) },
  home: { name: homeName, lineup: createDefaultLineup(homeName) },
  innings: 9,
  status: "in-progress",
  timestamp: new Date().toISOString(),
  plays: [],
  state: {
    inning: 1,
    half: "top",       // "top" = away bats, "bottom" = home bats
    outs: 0,
    batterIndex: { away: 0, home: 0 },
    bases: { ...EMPTY_BASES },
  },
});

// ─── GAME SCORER: DERIVED COMPUTATIONS ──────────────────────────────
function deriveFromPlays(game) {
  const grid = { away: {}, home: {} };  // { away: { 1: { runs: 0, hits: 0 }, ... } }
  const totals = {
    away: { R: 0, H: 0, E: 0 },
    home: { R: 0, H: 0, E: 0 },
  };

  for (const play of game.plays) {
    const side = play.half === "top" ? "away" : "home";
    const oppSide = play.half === "top" ? "home" : "away";
    const inn = play.inning;

    if (!grid[side][inn]) grid[side][inn] = { runs: 0, hits: 0 };

    const evt = EVENTS[play.event];
    if (evt && evt.isHit) {
      grid[side][inn].hits += 1;
      totals[side].H += 1;
    }
    if (play.event === "E") {
      totals[oppSide].E += 1;
    }

    const runsScored = play.runsScored || 0;
    grid[side][inn].runs += runsScored;
    totals[side].R += runsScored;
  }

  // Determine max inning for grid display
  const maxInning = Math.max(
    game.innings,
    game.state.inning,
    ...Object.keys(grid.away).map(Number),
    ...Object.keys(grid.home).map(Number)
  );

  return { grid, totals, maxInning };
}

// ─── GAME SCORER: STATE MACHINE ─────────────────────────────────────
function advanceRunners(bases, event) {
  // Returns { newBases, runsScored } based on event type
  // This is a simplified model — user can adjust runners before confirming
  let newBases = { ...bases };
  let runsScored = 0;

  const scoreRunner = () => { runsScored += 1; };

  switch (event) {
    case "HR":
      if (newBases.third) scoreRunner();
      if (newBases.second) scoreRunner();
      if (newBases.first) scoreRunner();
      scoreRunner(); // batter
      newBases = { ...EMPTY_BASES };
      break;

    case "3B":
      if (newBases.third) scoreRunner();
      if (newBases.second) scoreRunner();
      if (newBases.first) scoreRunner();
      newBases = { first: null, second: null, third: "batter" };
      break;

    case "2B":
      if (newBases.third) scoreRunner();
      if (newBases.second) scoreRunner();
      if (newBases.first) { newBases.third = newBases.first; newBases.first = null; }
      newBases.second = "batter";
      break;

    case "1B":
      if (newBases.third) scoreRunner();
      if (newBases.second) { newBases.third = newBases.second; }
      if (newBases.first) { newBases.second = newBases.first; }
      newBases.first = "batter";
      break;

    case "BB":
    case "HBP":
      // Force: runners advance only if forced
      if (newBases.first) {
        if (newBases.second) {
          if (newBases.third) scoreRunner();
          newBases.third = newBases.second;
        }
        newBases.second = newBases.first;
      }
      newBases.first = "batter";
      break;

    case "K":
    case "OUT":
    case "FO":
      // No runner movement by default on simple outs
      break;

    case "FC":
      // Fielder's choice: batter reaches first, one runner is out
      // Default: lead runner is out, others hold
      if (newBases.third) { newBases.third = null; }
      else if (newBases.second) { newBases.second = null; }
      else if (newBases.first) { newBases.first = null; }
      newBases.first = "batter";
      break;

    case "DP":
      // Double play: batter out + lead runner out, others hold
      if (newBases.first) { newBases.first = null; }
      else if (newBases.second) { newBases.second = null; }
      break;

    case "SAC":
      // Sac bunt/fly: batter out, runners advance one
      if (newBases.third) scoreRunner();
      if (newBases.second) { newBases.third = newBases.second; newBases.second = null; }
      if (newBases.first) { newBases.second = newBases.first; newBases.first = null; }
      break;

    case "E":
      // Error: treat like single for runner advancement
      if (newBases.third) scoreRunner();
      if (newBases.second) { newBases.third = newBases.second; }
      if (newBases.first) { newBases.second = newBases.first; }
      newBases.first = "batter";
      break;

    default:
      break;
  }

  return { newBases, runsScored };
}

// ─── SHARED UI COMPONENTS ────────────────────────────────────────────
const StarRating = ({ rating, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onChange && onChange(s)} style={{ cursor: onChange ? "pointer" : "default", fontSize: 14, color: s <= (rating || 0) ? "#f59e0b" : "rgba(255,255,255,0.2)", transition: "color 0.15s" }}>★</span>
    ))}
  </div>
);

const RoofBadge = ({ roof }) => {
  const colors = { "Open": ["#48bb78","rgba(72,187,120,0.15)"], "Retractable": ["#63b3ed","rgba(99,179,237,0.15)"], "Fixed": ["#f59e0b","rgba(245,158,11,0.15)"] };
  const [c, bg] = colors[roof] || ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.06)"];
  return <span className="pill" style={{ color: c, background: bg }}>{roof}</span>;
};

// ─── GAME SCORER: DIAMOND COMPONENT ─────────────────────────────────
const Diamond = ({ bases, size = 80 }) => {
  const mid = size / 2;
  const r = size * 0.35;
  const baseSize = size * 0.14;
  const positions = {
    first:  { x: mid + r, y: mid },
    second: { x: mid, y: mid - r },
    third:  { x: mid - r, y: mid },
    home:   { x: mid, y: mid + r },
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Diamond outline */}
      <polygon
        points={`${positions.home.x},${positions.home.y} ${positions.first.x},${positions.first.y} ${positions.second.x},${positions.second.y} ${positions.third.x},${positions.third.y}`}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1.5}
      />
      {/* Base markers */}
      {["first", "second", "third"].map(base => (
        <rect
          key={base}
          x={positions[base].x - baseSize / 2}
          y={positions[base].y - baseSize / 2}
          width={baseSize}
          height={baseSize}
          rx={2}
          transform={`rotate(45 ${positions[base].x} ${positions[base].y})`}
          fill={bases[base] ? "#f59e0b" : "rgba(255,255,255,0.08)"}
          stroke={bases[base] ? "#f59e0b" : "rgba(255,255,255,0.2)"}
          strokeWidth={1}
        />
      ))}
      {/* Home plate */}
      <polygon
        points={`${positions.home.x},${positions.home.y + baseSize * 0.5} ${positions.home.x - baseSize * 0.4},${positions.home.y} ${positions.home.x - baseSize * 0.3},${positions.home.y - baseSize * 0.4} ${positions.home.x + baseSize * 0.3},${positions.home.y - baseSize * 0.4} ${positions.home.x + baseSize * 0.4},${positions.home.y}`}
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1}
      />
    </svg>
  );
};

// ─── GAME SCORER: BOX SCORE COMPONENT ───────────────────────────────
const BoxScore = ({ game }) => {
  const { grid, totals, maxInning } = deriveFromPlays(game);
  const innings = Array.from({ length: maxInning }, (_, i) => i + 1);

  const cellStyle = (highlight) => ({
    width: 28, textAlign: "center", fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: highlight ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
    padding: "4px 0",
  });

  const headerStyle = {
    ...cellStyle(false),
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    letterSpacing: 0.5,
  };

  const totalStyle = (val) => ({
    ...cellStyle(val > 0),
    fontWeight: 600,
    minWidth: 32,
    color: val > 0 ? "#fff" : "rgba(255,255,255,0.3)",
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <td style={{ ...headerStyle, textAlign: "left", width: 80 }}></td>
            {innings.map(i => <td key={i} style={headerStyle}>{i}</td>)}
            <td style={{ ...headerStyle, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>R</td>
            <td style={headerStyle}>H</td>
            <td style={headerStyle}>E</td>
          </tr>
        </thead>
        <tbody>
          {["away", "home"].map(side => (
            <tr key={side} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", padding: "6px 0", textAlign: "left" }}>
                {game[side].name}
              </td>
              {innings.map(i => {
                const cell = grid[side][i];
                const isCurrent = game.state.inning === i && ((side === "away" && game.state.half === "top") || (side === "home" && game.state.half === "bottom"));
                return (
                  <td key={i} style={{
                    ...cellStyle(cell && cell.runs > 0),
                    background: isCurrent ? "rgba(99,179,237,0.08)" : "transparent",
                  }}>
                    {cell ? cell.runs : (isCurrent && game.status === "in-progress" ? "·" : "")}
                  </td>
                );
              })}
              <td style={{ ...totalStyle(totals[side].R), borderLeft: "1px solid rgba(255,255,255,0.1)" }}>{totals[side].R}</td>
              <td style={totalStyle(totals[side].H)}>{totals[side].H}</td>
              <td style={totalStyle(totals[side].E)}>{totals[side].E}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── GAME SCORER: MAIN COMPONENT ────────────────────────────────────
const GameScorer = ({ onBack }) => {
  const [game, setGame] = useState(() => createNewGame("Away", "Home"));
  const [pendingEvent, setPendingEvent] = useState(null);
  const [pendingBases, setPendingBases] = useState(null);
  const [pendingRuns, setPendingRuns] = useState(0);
  const [pendingRbi, setPendingRbi] = useState(0);
  const [pendingNotes, setPendingNotes] = useState("");
  const [playLog, setPlayLog] = useState([]);

  const battingSide = game.state.half === "top" ? "away" : "home";
  const currentBatterIdx = game.state.batterIndex[battingSide];
  const currentBatter = game[battingSide].lineup[currentBatterIdx % 9];
  const { totals } = deriveFromPlays(game);

  const selectEvent = useCallback((eventKey) => {
    const evt = EVENTS[eventKey];
    const { newBases, runsScored } = advanceRunners(game.state.bases, eventKey);

    setPendingEvent(eventKey);
    setPendingBases(newBases);
    setPendingRuns(runsScored);
    setPendingRbi(runsScored);
    setPendingNotes("");

    // Auto-commit for simple events (K, OUT, FO, HR, BB, HBP)
    if (evt.autoCommit) {
      commitPlay(eventKey, newBases, runsScored, runsScored, "");
    }
  }, [game]);

  const commitPlay = useCallback((event, bases, runs, rbi, notes) => {
    setGame(prev => {
      const evt = EVENTS[event];
      const side = prev.state.half === "top" ? "away" : "home";
      const newOuts = prev.state.outs + evt.outs;

      const play = {
        inning: prev.state.inning,
        half: prev.state.half,
        batter: prev[side].lineup[prev.state.batterIndex[side] % 9].name,
        event,
        runnersStart: { ...prev.state.bases },
        runnerAdvances: bases,
        runsScored: runs,
        rbi,
        outsOnPlay: evt.outs,
        notes,
        timestamp: new Date().toISOString(),
      };

      const newPlays = [...prev.plays, play];

      // Check for 3 outs — flip half or advance inning
      if (newOuts >= 3) {
        const isBottom = prev.state.half === "bottom";
        const newInning = isBottom ? prev.state.inning + 1 : prev.state.inning;
        const newHalf = isBottom ? "top" : "bottom";

        // Check for game over (bottom of 9+ and home leads, or end of 9+)
        const derivedAfter = deriveFromPlays({ ...prev, plays: newPlays });
        const isLateGame = prev.state.inning >= prev.innings;

        let gameOver = false;
        if (isLateGame && isBottom) {
          // End of a full inning, 9+
          gameOver = true;
        }
        if (isLateGame && !isBottom && derivedAfter.totals.home.R > derivedAfter.totals.away.R) {
          // Walk-off: home team takes lead in bottom of 9+
          gameOver = true;
        }

        return {
          ...prev,
          plays: newPlays,
          status: gameOver ? "final" : prev.status,
          state: {
            ...prev.state,
            inning: gameOver ? prev.state.inning : newInning,
            half: gameOver ? prev.state.half : newHalf,
            outs: 0,
            bases: { ...EMPTY_BASES },
            batterIndex: {
              ...prev.state.batterIndex,
              [side]: prev.state.batterIndex[side] + 1,
            },
          },
        };
      }

      // Not 3 outs — just advance batter
      return {
        ...prev,
        plays: newPlays,
        state: {
          ...prev.state,
          outs: newOuts,
          bases: bases,
          batterIndex: {
            ...prev.state.batterIndex,
            [side]: prev.state.batterIndex[side] + 1,
          },
        },
      };
    });

    setPendingEvent(null);
    setPendingBases(null);
  }, []);

  const confirmPending = useCallback(() => {
    if (pendingEvent) {
      commitPlay(pendingEvent, pendingBases, pendingRuns, pendingRbi, pendingNotes);
    }
  }, [pendingEvent, pendingBases, pendingRuns, pendingRbi, pendingNotes, commitPlay]);

  const cancelPending = useCallback(() => {
    setPendingEvent(null);
    setPendingBases(null);
  }, []);

  const undoLastPlay = useCallback(() => {
    setGame(prev => {
      if (prev.plays.length === 0) return prev;
      const newPlays = prev.plays.slice(0, -1);

      // Rebuild state from scratch by replaying all plays
      let state = {
        inning: 1,
        half: "top",
        outs: 0,
        batterIndex: { away: 0, home: 0 },
        bases: { ...EMPTY_BASES },
      };

      for (const play of newPlays) {
        const side = play.half === "top" ? "away" : "home";
        const evt = EVENTS[play.event];
        const newOuts = state.outs + evt.outs;

        if (newOuts >= 3) {
          const isBottom = state.half === "bottom";
          state = {
            inning: isBottom ? state.inning + 1 : state.inning,
            half: isBottom ? "top" : "bottom",
            outs: 0,
            bases: { ...EMPTY_BASES },
            batterIndex: {
              ...state.batterIndex,
              [side]: state.batterIndex[side] + 1,
            },
          };
        } else {
          state = {
            ...state,
            outs: newOuts,
            bases: play.runnerAdvances,
            batterIndex: {
              ...state.batterIndex,
              [side]: state.batterIndex[side] + 1,
            },
          };
        }
      }

      return { ...prev, plays: newPlays, state, status: "in-progress" };
    });
  }, []);

  const outDots = [0, 1, 2].map(i => (
    <div key={i} style={{
      width: 10, height: 10, borderRadius: "50%",
      background: i < game.state.outs ? "#ef4444" : "rgba(255,255,255,0.1)",
      border: `1px solid ${i < game.state.outs ? "#ef4444" : "rgba(255,255,255,0.2)"}`,
      transition: "all 0.15s",
    }} />
  ));

  const eventButtons = Object.entries(EVENTS);
  const hitEvents = eventButtons.filter(([_, e]) => e.isHit);
  const outEvents = eventButtons.filter(([k, e]) => !e.isHit && e.outs > 0);
  const otherEvents = eventButtons.filter(([k, e]) => !e.isHit && e.outs === 0);

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding: "6px 12px", fontSize: 12 }}>← Back</button>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2 }}>GAME SCORER</div>
        </div>
        {game.status === "final" && (
          <span className="pill" style={{ color: "#48bb78", background: "rgba(72,187,120,0.15)", fontSize: 12, padding: "4px 12px" }}>FINAL</span>
        )}
        {game.status === "in-progress" && (
          <span className="pill" style={{ color: "#63b3ed", background: "rgba(99,179,237,0.15)", fontSize: 12, padding: "4px 12px" }}>LIVE</span>
        )}
      </div>

      {/* Box Score */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <BoxScore game={game} />
      </div>

      {/* Game state panel */}
      {game.status === "in-progress" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Left: situation */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 4 }}>INNING</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>
                  {game.state.half === "top" ? "▲" : "▼"} {game.state.inning}
                </div>
              </div>
              <Diamond bases={game.state.bases} size={72} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 6 }}>OUTS</div>
                <div style={{ display: "flex", gap: 4 }}>{outDots}</div>
              </div>
            </div>

            {/* Current batter */}
            <div style={{ background: "rgba(99,179,237,0.06)", border: "1px solid rgba(99,179,237,0.15)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#63b3ed" }} />
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>AT BAT</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{currentBatter.name}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {game[battingSide].name}
              </div>
            </div>
          </div>

          {/* Right: event buttons */}
          <div className="card" style={{ padding: "20px 24px" }}>
            {pendingEvent ? (
              /* Confirmation panel */
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 10 }}>CONFIRM PLAY</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: EVENTS[pendingEvent].isHit ? "#48bb78" : "#ef4444" }}>
                    {pendingEvent}
                  </span>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {currentBatter.name}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>RUNS</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2,3,4].map(n => (
                        <button key={n} onClick={() => setPendingRuns(n)} style={{
                          width: 28, height: 28, borderRadius: 6, border: "1px solid",
                          borderColor: pendingRuns === n ? "rgba(99,179,237,0.5)" : "rgba(255,255,255,0.1)",
                          background: pendingRuns === n ? "rgba(99,179,237,0.15)" : "transparent",
                          color: pendingRuns === n ? "#63b3ed" : "rgba(255,255,255,0.4)",
                          fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>RBI</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2,3,4].map(n => (
                        <button key={n} onClick={() => setPendingRbi(n)} style={{
                          width: 28, height: 28, borderRadius: 6, border: "1px solid",
                          borderColor: pendingRbi === n ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)",
                          background: pendingRbi === n ? "rgba(245,158,11,0.15)" : "transparent",
                          color: pendingRbi === n ? "#f59e0b" : "rgba(255,255,255,0.4)",
                          fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={pendingNotes}
                  onChange={e => setPendingNotes(e.target.value)}
                  style={{ marginBottom: 12, fontSize: 12 }}
                />

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={confirmPending} style={{ flex: 1, fontSize: 12 }}>Confirm</button>
                  <button className="btn-ghost" onClick={cancelPending} style={{ fontSize: 12 }}>Cancel</button>
                </div>
              </div>
            ) : (
              /* Event selection */
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 10 }}>HITS</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {hitEvents.map(([key]) => (
                    <button key={key} onClick={() => selectEvent(key)} style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(72,187,120,0.3)",
                      background: "rgba(72,187,120,0.08)", color: "#48bb78",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{key}</button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 10 }}>OUTS</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {outEvents.map(([key]) => (
                    <button key={key} onClick={() => selectEvent(key)} style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.08)", color: "#ef4444",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{key}</button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 10 }}>OTHER</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {otherEvents.map(([key]) => (
                    <button key={key} onClick={() => selectEvent(key)} style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{key}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Play log */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>PLAY LOG</div>
          {game.plays.length > 0 && game.status === "in-progress" && (
            <button className="btn-ghost" onClick={undoLastPlay} style={{ padding: "4px 10px", fontSize: 11 }}>↩ Undo</button>
          )}
        </div>
        {game.plays.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
            No plays yet. Select an event to begin scoring.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 240, overflowY: "auto" }}>
            {[...game.plays].reverse().map((play, i) => {
              const evt = EVENTS[play.event];
              return (
                <div key={game.plays.length - 1 - i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                  background: "rgba(255,255,255,0.02)", borderRadius: 6,
                }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", width: 36, flexShrink: 0 }}>
                    {play.half === "top" ? "▲" : "▼"}{play.inning}
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
                    color: evt.isHit ? "#48bb78" : evt.outs > 0 ? "#ef4444" : "#63b3ed",
                    width: 28, flexShrink: 0,
                  }}>{play.event}</span>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1 }}>{play.batter}</div>
                  {play.runsScored > 0 && (
                    <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace" }}>
                      +{play.runsScored}R
                    </span>
                  )}
                  {play.notes && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {play.notes}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0d12; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; transition: all 0.2s; }
  .card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
  .park-row { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; transition: all 0.15s; cursor: pointer; }
  .park-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(99,179,237,0.3); transform: translateX(2px); }
  .nav-btn { background: transparent; border: none; color: rgba(255,255,255,0.45); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.3px; }
  .nav-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); }
  .nav-btn.active { color: #63b3ed; background: rgba(99,179,237,0.12); }
  .pill { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 4px; }
  .filter-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: rgba(255,255,255,0.5); font-family: 'DM Sans',sans-serif; font-size: 12px; padding: 5px 12px; cursor: pointer; transition: all 0.15s; }
  .filter-btn.active { background: rgba(99,179,237,0.12); border-color: rgba(99,179,237,0.3); color: #63b3ed; }
  input, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: rgba(255,255,255,0.9); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 10px; width: 100%; outline: none; transition: border-color 0.15s; }
  input:focus, textarea:focus { border-color: rgba(99,179,237,0.4); }
  select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: rgba(255,255,255,0.9); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 10px; width: 100%; outline: none; }
  select option { background: #1a1f2e; }
  .btn-primary { background: rgba(99,179,237,0.15); border: 1px solid rgba(99,179,237,0.35); color: #63b3ed; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 8px 18px; border-radius: 7px; cursor: pointer; transition: all 0.15s; }
  .btn-primary:hover { background: rgba(99,179,237,0.25); }
  .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 18px; border-radius: 7px; cursor: pointer; transition: all 0.15s; }
  .btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: #11151e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .progress-track { background: rgba(255,255,255,0.06); border-radius: 99px; height: 6px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #63b3ed, #48bb78); transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .event-btn { transition: all 0.1s; }
  .event-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
  .event-btn:active { transform: scale(0.95); }
`;

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────
export default function MLBDashboard() {
  const [parks, setParks] = useState(PARKS);
  const [view, setView] = useState("overview");
  const [selectedPark, setSelectedPark] = useState(null);
  const [filterVisited, setFilterVisited] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const visited = parks.filter(p => p.visited);
  const nextParks = parks.filter(p => NEXT_TARGETS.includes(p.id));
  const ratedVisits = visited.filter(p => typeof p.rating === "number");
  const avgRating = ratedVisits.length ? (ratedVisits.reduce((a,p)=>a+p.rating,0) / ratedVisits.length).toFixed(1) : "—";
  const pct = Math.round((visited.length / 30) * 100);

  const openPark = (park) => {
    setSelectedPark(park);
    setEditData({ ...park });
    setEditMode(false);
  };

  const saveEdit = () => {
    setParks(prev => prev.map(p => p.id === editData.id ? { ...editData } : p));
    setSelectedPark({ ...editData });
    setEditMode(false);
  };

  const filteredParks = parks.filter(p => {
    if (filterVisited === "visited") return p.visited;
    if (filterVisited === "unvisited") return !p.visited;
    return true;
  });

  const statusColor = (s) => s === "in-progress" ? "#f59e0b" : s === "done" ? "#34d399" : "#94a3b8";
  const statusBg = (s) => s === "in-progress" ? "rgba(245,158,11,0.15)" : s === "done" ? "rgba(52,211,153,0.15)" : "rgba(148,163,184,0.15)";
  const statusLabel = (s) => s === "in-progress" ? "In Progress" : s === "done" ? "Done" : "Not Started";

  const NAV_ITEMS = [
    ["overview", "Overview"],
    ["parks", "All Parks"],
    ["next", "Next Up"],
    ["milestones", "Milestones"],
    ["game", "Game Scorer"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d12", color: "rgba(255,255,255,0.9)", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
      <style>{CSS}</style>

      {/* Background arc decoration */}
      <div style={{ position: "fixed", top: 0, right: 0, width: 600, height: 600, background: "radial-gradient(ellipse at top right, rgba(99,179,237,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, width: 400, height: 400, background: "radial-gradient(ellipse at bottom left, rgba(72,187,120,0.03) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1a3a5c, #0d2137)", border: "1px solid rgba(99,179,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚾</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#fff", lineHeight: 1 }}>MLB BALLPARKS QUEST</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>OWNER: GRATEFUL DATA</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 4 }}>
            {NAV_ITEMS.map(([k, l]) => (
              <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{l}</button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: "#63b3ed" }}>{visited.length}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>/30</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>VISITED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>

        {/* GAME SCORER TAB */}
        {view === "game" && (
          <GameScorer onBack={() => setView("overview")} />
        )}

        {/* OVERVIEW */}
        {view === "overview" && (
          <div>
            {/* Hero banner */}
            <div className="card" style={{ marginBottom: 28, padding: "32px 36px", background: "linear-gradient(135deg, rgba(26,58,92,0.6) 0%, rgba(10,13,18,0.8) 60%)", border: "1px solid rgba(99,179,237,0.15)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(99,179,237,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: -10, right: -10, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(99,179,237,0.05)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 3, lineHeight: 1, color: "#fff", marginBottom: 4 }}>
                    {pct}<span style={{ fontSize: 28, color: "rgba(255,255,255,0.4)" }}>%</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>of all 30 MLB ballparks visited · {30 - visited.length} remaining</div>
                  <div style={{ marginTop: 16, width: 320 }}>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  {[["S-Tier", parks.filter(p=>p.tier==="S").length], ["A-Tier", parks.filter(p=>p.tier==="A").length], ["Avg Rating", avgRating]].map(([l,v]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#63b3ed" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              {[
                ["🗺️", "Planning", "Route and next parks TBD", "not-started"],
                ["✈️", "Next Target", nextParks[0]?.stadium || "—", "in-progress"],
                ["📸", "Photos logged", "0 ballparks", "not-started"],
                ["📋", "Capture ready", "Workflow proven at 0/3", "in-progress"],
              ].map(([ico, label, val, st]) => (
                <div key={label} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{ico}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Two-col: next targets + visited */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 12 }}>NEXT PARKS BUCKET LIST</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {nextParks.map((p, i) => (
                    <div key={p.id} className="park-row" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => openPark(p)}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "rgba(99,179,237,0.4)", width: 24 }}>#{i+1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{p.stadium}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.city}</div>
                      </div>
                      <RoofBadge roof={p.roof} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 12 }}>VISITED PARKS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {visited.map(p => (
                    <div key={p.id} className="park-row" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderColor: "rgba(72,187,120,0.15)" }} onClick={() => openPark(p)}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#48bb78", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{p.stadium}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.visitDate} · {p.city}</div>
                      </div>
                      {p.tier && <span className="pill" style={{ color: TIERS[p.tier].color, background: TIERS[p.tier].bg }}>{p.tier}-Tier</span>}
                      <StarRating rating={p.rating} />
                    </div>
                  ))}
                  {visited.length === 0 && <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No parks logged yet. Start exploring!</div>}
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="card" style={{ marginTop: 24, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 14 }}>NEXT STEPS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Finish populating missing Place values for any parks that don't plot on the map.",
                  "Decide the next 3 parks and mark them Want to Visit.",
                  "Add a first-pass Favorite Tier and Best Feature for visited parks.",
                  "Add at least one photo to a ballpark record to make gallery views useful.",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALL PARKS */}
        {view === "parks" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2 }}>ALL 30 BALLPARKS</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["all","All"],["visited","Visited"],["unvisited","Unvisited"]].map(([k,l]) => (
                  <button key={k} className={`filter-btn ${filterVisited===k?"active":""}`} onClick={() => setFilterVisited(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {filteredParks.map(p => (
                <div key={p.id} className="park-row" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, borderColor: p.visited ? "rgba(72,187,120,0.15)" : "rgba(255,255,255,0.06)" }} onClick={() => openPark(p)}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.visited ? "#48bb78" : "rgba(255,255,255,0.12)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.stadium}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{p.team}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <RoofBadge roof={p.roof} />
                    {p.tier && <span className="pill" style={{ color: TIERS[p.tier].color, background: TIERS[p.tier].bg }}>{p.tier}-Tier</span>}
                  </div>
                  {p.rating && <StarRating rating={p.rating} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEXT UP */}
        {view === "next" && (
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>NEXT PARKS SHORTLIST</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Your curated bucket list. Click any park to log notes, tiers, or visit details.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {nextParks.map((p, i) => (
                <div key={p.id} className="card" style={{ padding: "24px 28px", cursor: "pointer", borderColor: "rgba(99,179,237,0.12)" }} onClick={() => openPark(p)}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "rgba(99,179,237,0.15)", lineHeight: 1, width: 52 }}>#{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, color: "#fff", marginBottom: 4 }}>{p.stadium}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>{p.team} · {p.city}</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <RoofBadge roof={p.roof} />
                        <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>{p.surface}</span>
                        <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>Est. {p.opened}</span>
                        <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>{p.capacity.toLocaleString()} cap</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(99,179,237,0.6)", letterSpacing: 1 }}>WANT TO VISIT →</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "rgba(245,158,11,0.04)", border: "1px dashed rgba(245,158,11,0.2)" }}>
              <div style={{ fontSize: 12, color: "rgba(245,158,11,0.6)" }}>Add more parks to your shortlist by clicking any park in "All Parks" and editing tier/notes.</div>
            </div>
          </div>
        )}

        {/* MILESTONES */}
        {view === "milestones" && (
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 24 }}>PROJECT MILESTONES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {MILESTONES.map((m, i) => (
                <div key={i} className="card" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: "#fff", marginBottom: 6 }}>{m.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{m.done}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginBottom: 6 }}>TARGET</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{m.target}</div>
                      <div style={{ marginTop: 10 }}>
                        <span className="pill" style={{ color: statusColor(m.status), background: statusBg(m.status) }}>{statusLabel(m.status)}</span>
                      </div>
                    </div>
                  </div>
                  {m.status === "in-progress" && (
                    <div style={{ marginTop: 16 }}>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: "30%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PARK MODAL */}
      {selectedPark && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPark(null); }}>
          <div className="modal">
            <div style={{ padding: "28px 28px 0" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{selectedPark.stadium}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{selectedPark.team} · {selectedPark.city}</div>
                </div>
                <button onClick={() => setSelectedPark(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, width: 30, height: 30, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                <RoofBadge roof={selectedPark.roof} />
                <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>{selectedPark.surface}</span>
                <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>Est. {selectedPark.opened}</span>
                <span className="pill" style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}>{selectedPark.capacity.toLocaleString()} seats</span>
                {selectedPark.visited && <span className="pill" style={{ color: "#48bb78", background: "rgba(72,187,120,0.15)" }}>Visited</span>}
              </div>
            </div>

            <div style={{ padding: "0 28px 28px" }}>
              {!editMode ? (
                <div>
                  {selectedPark.visited && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>VISIT LOG</div>
                        <StarRating rating={selectedPark.rating} />
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{selectedPark.visitDate}</div>
                      {selectedPark.bestFeature && <div style={{ fontSize: 13, color: "#63b3ed", marginBottom: 8 }}>{selectedPark.bestFeature}</div>}
                      {selectedPark.notes && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px" }}>{selectedPark.notes}</div>}
                      {selectedPark.tier && <div style={{ marginTop: 10 }}><span className="pill" style={{ color: TIERS[selectedPark.tier].color, background: TIERS[selectedPark.tier].bg }}>{selectedPark.tier}-Tier</span></div>}
                    </div>
                  )}
                  {!selectedPark.visited && (
                    <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                      Not yet visited. Log your visit below.
                    </div>
                  )}
                  <button className="btn-primary" onClick={() => setEditMode(true)} style={{ width: "100%" }}>
                    {selectedPark.visited ? "Edit Visit Log" : "+ Log This Visit"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 4 }}>EDIT PARK LOG</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Visit Date</div>
                      <input type="date" value={editData.visitDate || ""} onChange={e => setEditData(d => ({...d, visitDate: e.target.value, visited: !!e.target.value}))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Tier</div>
                      <select value={editData.tier || ""} onChange={e => setEditData(d => ({...d, tier: e.target.value || null}))}>
                        <option value="">No tier</option>
                        {Object.keys(TIERS).map(t => <option key={t} value={t}>{t}-Tier</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Rating</div>
                    <StarRating rating={editData.rating} onChange={r => setEditData(d => ({...d, rating: r}))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Best Feature</div>
                    <input type="text" placeholder="e.g. Green Monster, river views…" value={editData.bestFeature || ""} onChange={e => setEditData(d => ({...d, bestFeature: e.target.value}))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Notes</div>
                    <textarea rows={4} placeholder="What made this park memorable?" value={editData.notes || ""} onChange={e => setEditData(d => ({...d, notes: e.target.value}))} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={saveEdit} style={{ flex: 1 }}>Save</button>
                    <button className="btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
