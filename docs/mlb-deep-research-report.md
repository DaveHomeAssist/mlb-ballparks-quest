# Section 1: System Overview  
- **Platform:** Single-page offline web app (one HTML file with embedded CSS/JS)【21†L56-L64】【5†L1-L4】.  All state is client-side (LocalStorage) so it works fully offline【13†L147-L155】【26†L128-L133】.  
- **Game Loop:** Turn-based “Plan → Simulate → Score → Iterate” cycle【32†L159-L161】. The player places crops on an 8×4 grid (Plan), clicks **Simulate** to run the season evaluation, then sees a numeric score and diagnostic output. The player then adjusts the layout and repeats.  
- **Determinism:** No randomness – every outcome is fully determined by the layout. This lets us give precise explanations for any low score.  
- **Scoring:** Scores are diagnostic. Each cell yields base points; *hard violations* (illegal placements) and *advisory penalties* (inefficiencies) subtract points, while *companion buffs* or *zone bonuses* add points. (For example, planting complementary neighbors yields extra points, analogous to the adjacency bonuses in Civilization VI【29†L220-L228】.) Every low score triggers visible causes.  
- **Narration:** Two characters comment on results: **Garden Gurl** (practical, dry-humored narrator) and **Onion Man** (emotional, comedic commentator). They use plain, deterministic humor (no mystical metaphors, no em dashes). Garden Gurl calls out violations; Onion Man reacts to wins/losses.  
- **UI Components:** Title banner, 8×4 grid board (cells), crop-selection panel (buttons), **Simulate** and **Reset** buttons, score display, narrator text panel, and a (stub) challenge progress panel. These are all managed via DOM updates in JavaScript (no page reload).  
- **Tech Stack:** Vanilla JavaScript, HTML5 & CSS3. All data is saved with Web Storage (localStorage)【13†L147-L155】【26†L128-L133】.  Follows a classic SPA model【21†L56-L64】: one HTML/CSS/JS bundle, dynamic updates on user actions.  

# Section 2: Architecture Diagram Explanation  
The game is organized into UI, engine, and data layers:  

- **View (UI Layer):** HTML/CSS renders the grid and controls. User clicks on crop-buttons select a crop; clicking grid cells places or erases that crop. CSS classes (e.g. `cropT`, `cropB`) color each plant type.  
- **Controller / Engine:** JavaScript functions handle events: placement updates the **Model**, and the **Simulate** button triggers the scoring algorithm. This logic is the “game loop” (process input, update state, render)【32†L159-L161】, albeit turn-based rather than continuous.  
- **Model (Data Layer):** In-memory JS structures represent the state. For example: a 2D array `grid[row][col]` holds each cell’s crop code (or empty), and objects/arrays hold crop definitions and score history. On each action, the model is updated and then saved to `localStorage` (serialized as JSON【13†L147-L155】) for persistence.  
- **Data Flow:** User inputs (clicks) → update `grid` model → (on simulate) compute score → update UI panels (score, narrative). The UI always reflects the current model state.  
- **Persistence:** The model (particularly score history) is stored in `localStorage`. On each simulation, we append the score to a JSON array in `localStorage`【13†L147-L155】 (capped at 10 entries). This ensures “local-first” behavior【5†L1-L4】.  

The interplay can be summarized as:  

```
[User Input (clicks)]  
    ↓  
[View/Controller (DOM & JS handlers)]  
    ↓  (updates)  
[Model (grid array, scores, etc.)]  ← localStorage (JSON)  
    ↓  (on Simulate)  
[Engine (simulation & scoring logic)]  
    ↓ (outputs)  
[UI Update: Score Panel, Narration, Highlight violations]  
```

# Section 3: Data Models  
- **Grid Model (`grid[4][8]`):** 2D array of cell objects or crop IDs. E.g. `grid[r][c] = "T"` for Tomato, or `""`/`null` if empty. The DOM `<div id="cell-r-c">` and `data-crop` attributes mirror this model.  
- **Crop Roster:** Array of crop definitions. Each entry has `{id, name, category, ...}`. (Seed example: see `crop-roster.json` below.) This drives the palette.  
- **Score Report:** On simulation, we create an object `{score, hardCount, advisoryCount, buffCount, hardReasons[], advisoryReasons[]}`. This structure is used to update the score panel and narrator.  
- **Narrator Guide:** A map of conditions to lines. (In `game-voice-guide.md`, we can list example dialogues for Garden Gurl and Onion Man.)  
- **Persistence:** We store JSON in `localStorage`, e.g. `localStorage.setItem('garden_scores', JSON.stringify(history))`. Here `history` might be an array of `{score,date}` objects. (As StackOverflow notes, we convert objects to strings via JSON【13†L147-L155】.)  
- **Config Schemas:** We also define seed-file JSON schemas (see Section 7) for scenarios, pests, achievements, etc. These define additional data models (e.g. `scenario = {name, gridInit, pests:[...], rules:...}`).

# Section 4: Complete HTML Game Artifact  
Below is the full HTML file (`garden-os-simulator.html`). It includes all CSS and JavaScript inline. Save this as a single `.html` and open in a modern browser.  

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Garden OS Builder</title>
<style>
body {font-family:sans-serif; margin:20px;}
h1 {margin-bottom:0.5em;}
#grid-container {display:grid; grid-template-columns: repeat(8,50px); grid-template-rows: repeat(4,50px); gap:2px;}
.cell {width:50px; height:50px; border:1px solid #666; text-align:center; vertical-align:middle; line-height:50px; font-weight:bold;}
.cell.empty {background:#f0f0f0;}
.cell.cropT {background:#f88; color:#500;}  /* Tomato */
.cell.cropB {background:#8f8; color:#050;}  /* Basil */
.cell.cropC {background:#ff8; color:#a50;}  /* Corn */
.cell.cropL {background:#8ff; color:#055;}  /* Lettuce */
.cell.cropR {background:#f8f; color:#505;}  /* Carrot */
#controls {margin-top:1em;}
#controls button {margin-right:0.5em;}
#score-panel {margin-top:1em; font-weight:bold;}
#violations-panel {margin-top:0.5em;}
#narrator-panel {margin-top:1em; padding:0.5em; background:#f9f9f9; border:1px solid #ccc; height:4em; overflow:auto;}
</style>
</head><body>
<h1>Garden OS: Builder Mode</h1>
<div id="grid-container"></div>
<div id="controls">
  Select Crop:
  <button data-crop="T">Tomato</button>
  <button data-crop="B">Basil</button>
  <button data-crop="C">Corn</button>
  <button data-crop="L">Lettuce</button>
  <button data-crop="R">Carrot</button>
  <button id="erase">Erase</button>
  <button id="simulate">Simulate</button>
  <button id="reset">Reset</button>
</div>
<div id="score-panel">Score: <span id="score-val">0</span></div>
<div id="violations-panel"></div>
<div id="narrator-panel"></div>
<script>
(() => {
  // Initialize 8×4 grid
  const rows=4, cols=8;
  const grid = document.getElementById('grid-container');
  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      const cell = document.createElement('div');
      cell.id = 'cell-'+r+'-'+c;
      cell.className = 'cell empty';
      cell.dataset.crop = '';
      cell.onclick = () => {
        if(selectedCrop!==null){
          if(selectedCrop==='erase'){
            cell.className='cell empty'; cell.dataset.crop=''; cell.textContent='';
          } else {
            cell.dataset.crop = selectedCrop;
            cell.className = 'cell crop'+selectedCrop;
            cell.textContent = selectedCrop;
          }
        }
      };
      grid.appendChild(cell);
    }
  }
  // Crop selection
  let selectedCrop = null;
  document.querySelectorAll('#controls button[data-crop]').forEach(btn => {
    btn.onclick = () => { selectedCrop = btn.dataset.crop; };
  });
  document.getElementById('erase').onclick = () => { selectedCrop='erase'; };
  // Reset button
  document.getElementById('reset').onclick = () => {
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const cell = document.getElementById('cell-'+r+'-'+c);
        cell.className='cell empty'; cell.dataset.crop=''; cell.textContent='';
      }
    }
    document.getElementById('score-val').textContent='0';
    document.getElementById('violations-panel').textContent='';
    document.getElementById('narrator-panel').textContent='';
  };
  // Simulate / scoring logic
  document.getElementById('simulate').onclick = () => {
    let base=0, hard=0, adv=0, buff=0;
    let hardReasons=[], advReasons=[];
    // Collect cell elements
    const cells = [];
    for(let r=0; r<rows; r++){
      cells[r]=[];
      for(let c=0; c<cols; c++){
        cells[r][c] = document.getElementById('cell-'+r+'-'+c);
      }
    }
    // Count base and hard violations
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const cell = cells[r][c];
        const crop = cell.dataset.crop;
        if(!crop) continue;
        base++;
        // Hard: Corn must be on last column (trellis at right edge)
        if(crop==='C' && c < cols-1){
          hard++;
          hardReasons.push('Corn needs trellis on right edge');
        }
      }
    }
    // Adjacency: right and down neighbors
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const cell = cells[r][c];
        const crop = cell.dataset.crop;
        if(!crop) continue;
        // Right neighbor
        if(c < cols-1){
          const nb = cells[r][c+1], nc = nb.dataset.crop;
          if(nc){
            // Companion buff: Tomato + Basil
            if((crop==='T' && nc==='B') || (crop==='B' && nc==='T')){
              buff++;
            }
            // Advisory: same type adjacent (for certain crops)
            if(crop===nc && 'BTLR'.includes(crop)){
              adv++; advReasons.push(crop+' plants too close');
            }
          }
        }
        // Down neighbor
        if(r < rows-1){
          const nb = cells[r+1][c], nc = nb.dataset.crop;
          if(nc){
            if((crop==='T' && nc==='B') || (crop==='B' && nc==='T')){
              buff++;
            }
            if(crop===nc && 'BTLR'.includes(crop)){
              adv++; advReasons.push(crop+' plants too close');
            }
          }
        }
      }
    }
    // Compute score
    let score = base + 2*buff - 3*hard - 1*adv;
    if(score < 0) score = 0;
    document.getElementById('score-val').textContent = score;
    // Show violation counts
    let violDiv = document.getElementById('violations-panel');
    violDiv.innerHTML = '';
    if(hard>0){
      violDiv.innerHTML = '🔴 Hard issues: '+hard;
    }
    if(adv>0){
      violDiv.innerHTML += (violDiv.innerHTML? '<br>':'')+'⚠ Advisory: '+adv;
    }
    // Narration output
    const narr = document.getElementById('narrator-panel');
    narr.innerHTML = '';
    if(hard>0){
      narr.innerHTML = 'Garden Gurl: '+(hardReasons[0]||'Illegal placement detected');
    } else if(adv>0){
      narr.innerHTML = 'Garden Gurl: Consider better spacing in your layout.';
    } else {
      if(buff>0){
        narr.innerHTML = 'Onion Man: Great combo! Your plants will thrive!';
      } else {
        narr.innerHTML = 'Garden Gurl: Layout looks good. Nice work!';
      }
    }
    // Save to localStorage (score history, last 10)
    let history = JSON.parse(localStorage.getItem('garden_scores')||'[]');
    history.push({score: score, date: (new Date()).toISOString()});
    if(history.length > 10) history.shift();
    localStorage.setItem('garden_scores', JSON.stringify(history));
  };
})();
</script>
</body></html>
```

# Section 5: Phase 2 (Scenario Engine) Scaffold  
*(Rescue Mission: Pest Outbreak)* We outline the framework without full implementation:  
- **Scenario Schema:** Define a JSON schema (`scenario-schema.json`) for loading missions. Each scenario might specify an initial grid layout, pest spawn points, objectives, etc.  
- **Pest Profiles:** In `pest-profiles.json`, list pest types (e.g. aphid, beetle) with attributes like spread rate and damage.  
- **Simulation Engine:** Extend the Phase 1 simulator to include pest logic: each “season” step applies pest damage or spread rules. If pests overlap crops, reduce yields or cause removals (hard violations).  
- **Narration & UI:** Garden Gurl would introduce the mission; Onion Man might react emotionally to pests. The UI might overlay pest indicators on the grid or show a “pest meter.”  
- **Persistence:** Scenario progress (e.g. mission completed flag) could be saved to localStorage under a campaign state.  

*No actual code is provided here*; these are placeholders showing where the scenario/pest systems would plug in.

# Section 6: Phase 3 (Draft League) Scaffold  
*(Garden League Draft Mode)* Outline of a competitive mode:  
- **League Config:** Use `league-config.json` to define draft rules (e.g. number of teams, pick order) and scoring format.  
- **Draft System:** Players (or AI teams) take turns “drafting” plants from a common pool into their garden roster. This requires a UI for selecting plants with a visible pool list.  
- **Competition:** After drafting, each team’s garden is scored (reusing the Phase 1 simulation). The league aggregates scores across rounds/seasons.  
- **UI & Progress:** Show a draft order panel, each team’s picks, and a scoreboard.  
- **Persistence:** Store league standings and picks in localStorage to resume the draft or view final rankings.  

*This is a high-level scaffold; no complete implementation is included.*

# Section 7: Seed File Schemas  
Below are minimal examples of each seed/config file:

- **game-voice-guide.md:** (Markdown narrative templates for characters)  
  ```md
  # Garden Gurl
  - Welcome! Let's get planting.
  - Careful, that placement looks risky.
  - Nice work – that layout is looking healthy.
  # Onion Man
  - Oh no, pests are nibbling away! *sniff*
  - Wow, this is great – it almost brought me to tears!
  ```
- **scoring-api.json:** (Defines scoring rules or categories)  
  ```json
  {
    "basePoints": 1,
    "hardViolation": {"penalty": 5, "message": "Illegal placement"},
    "advisoryPenalty": {"penalty": 1, "message": "Inefficient placement"},
    "companionBuff": {"bonus": 2, "pairs": [["Tomato","Basil"]]}
  }
  ```
- **scenario-schema.json:** (Structure for a garden scenario)  
  ```json
  {
    "id": "pest-outbreak-1",
    "initialLayout": [
      ["Tomato","Basil","","","","","",""],
      ["","","Corn","","","","",""],
      ["","","","","Lettuce","","",""],
      ["","","","","","","",""]
    ],
    "pests": [{"type": "aphid", "r": 0, "c": 2}],
    "objective": "Survive 4 seasons against pests"
  }
  ```
- **pest-profiles.json:** (List of pest behaviors)  
  ```json
  {
    "pests": [
      {"id": "aphid", "damage": 2, "spread": 0.3},
      {"id": "beetle", "damage": 3, "spread": 0.1}
    ]
  }
  ```
- **crop-roster.json:** (Definitions of crops available)  
  ```json
  {
    "crops": [
      {"id": "Tomato",   "category": "Fruiting",   "botanical": "Solanum"},
      {"id": "Basil",    "category": "Herb",      "botanical": "Ocimum"},
      {"id": "Corn",     "category": "Climber",   "botanical": "Zea"},
      {"id": "Lettuce",  "category": "Greens",    "botanical": "Lactuca"},
      {"id": "Carrot",   "category": "Root",      "botanical": "Daucus"}
    ]
  }
  ```
- **achievement-registry.json:** (Achievement definitions)  
  ```json
  {
    "achievements": [
      {"id": "first-plant", "name": "Green Thumb", "condition": "Place your first crop"},
      {"id": "no-violations", "name": "Perfect Planner", "condition": "Complete a garden with no violations"}
    ]
  }
  ```
- **league-config.json:** (League/draft settings)  
  ```json
  {
    "teams": ["Alpha", "Bravo", "Charlie"],
    "draftOrder": [0,1,2,2,1,0],
    "rounds": 3,
    "seasonLength": 4
  }
  ```

# Section 8: Run Instructions  
- **Save & Open:** Save the HTML code from Section 4 as `garden-os-simulator.html`. Open this file in any modern browser (Chrome, Firefox, Edge, Safari, etc.). It will run immediately with no server needed (all code is local).  
- **Offline Play:** The game is fully offline-capable. It uses the Web Storage API to save scores (supported in ~91% of browsers【26†L128-L133】), so your state persists even without internet.  
- **Usage:** Click a crop button to select a plant (Tomato, Basil, etc.), then click on a grid cell to place or erase it. Press **Simulate** to calculate the score and see feedback. The **Reset** button clears the board. Scores and comments will appear in the panels below the grid.

Good luck planting your perfect garden!  

