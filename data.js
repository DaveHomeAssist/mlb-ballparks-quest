(function attachDataModule(global) {
  "use strict";

  var namespace = global.BPQ = global.BPQ || {};
  var storage = namespace.storage;

  if (!storage) {
    throw new Error("BPQ.storage is required before loading data.js");
  }

  var config = namespace.config || (global.__QUEST_PLATFORM__ && global.__QUEST_PLATFORM__.config && global.__QUEST_PLATFORM__.config.getProductConfig("mlb")) || {};
  var storageKeys = (config.storage && config.storage.keys) || {};

  var KEYS = {
    parks: "parks",
    activeTrip: storageKeys.activeTrip || "activeTrip",
    visits: storageKeys.visits || "visits",
    planningNotes: storageKeys.planningNotes || "planningNotes"
  };

  var VALID_NOTE_SCOPES = ["park", "leg", "trip"];

  function isoNow() {
    return new Date().toISOString();
  }

  function cloneValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof global.structuredClone === "function") {
      return global.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function createId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefix + "-" + global.crypto.randomUUID();
    }
    return prefix + "-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  var SEEDED_PARKS = [
    { id: "chase-field", name: "Chase Field", team: "Arizona Diamondbacks", city: "Phoenix, AZ", opened: 1998, capacity: 48519, roof: "Retractable", tier: "C", color: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/29.png", ticketApproach: "Wait for resale inventory to soften on weekdays. Lower bowl third base stays reasonable.", transitNote: "Light rail works downtown. Plan a short walk in the heat.", coordinates: { lat: 33.4453, lng: -112.0667 }, specialEvents: ["Opening Day roof closed", "Friday fireworks", "Bobblehead gate giveaways"] },
    { id: "truist-park", name: "Truist Park", team: "Atlanta Braves", city: "Cumberland, GA", opened: 2017, capacity: 41084, roof: "Open", tier: "B", color: "#CE1141", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/16.png", ticketApproach: "Buy early for marquee weekends. The Battery drives up demand.", transitNote: "Rideshare is easier than MARTA. Budget time for postgame traffic.", coordinates: { lat: 33.8907, lng: -84.4677 }, specialEvents: ["Postgame concerts", "Weekend jersey promos", "Sunday family catch days"] },
    { id: "camden-yards", name: "Oriole Park at Camden Yards", team: "Baltimore Orioles", city: "Baltimore, MD", opened: 1992, capacity: 44970, roof: "Open", tier: "A", color: "#DF4601", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/1.png", ticketApproach: "Upper deck behind home is a strong value. Last minute resale is usually fine.", transitNote: "Camden Station puts you on top of the park. Harbor walk is easy before first pitch.", coordinates: { lat: 39.2839, lng: -76.6217 }, specialEvents: ["Opening Day block party", "Friday fireworks", "Birdland member giveaway nights"] },
    { id: "fenway-park", name: "Fenway Park", team: "Boston Red Sox", city: "Boston, MA", opened: 1912, capacity: 37755, roof: "Open", tier: "S", color: "#BD3039", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/2.png", ticketApproach: "Watch resale closely. Weeknight inventory opens late, but premium dates stay expensive.", transitNote: "Green Line to Kenmore is the cleanest move. Walk Lansdowne for pregame energy.", coordinates: { lat: 42.3467, lng: -71.0972 }, specialEvents: ["Monster seat tours", "Patriots Day matinee", "Sunday family autograph days"] },
    { id: "wrigley-field", name: "Wrigley Field", team: "Chicago Cubs", city: "Chicago, IL", opened: 1914, capacity: 41649, roof: "Open", tier: "S", color: "#0E3386", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/17.png", ticketApproach: "Bleachers spike on sunny weekends. Terrace and upper deck stay workable.", transitNote: "Red Line to Addison is direct. Plan for a crowded platform after the final out.", coordinates: { lat: 41.9484, lng: -87.6553 }, specialEvents: ["Friday day game demand", "Cubs Convention halo dates", "Neighborhood street festivals"] },
    { id: "guaranteed-rate-field", name: "Guaranteed Rate Field", team: "Chicago White Sox", city: "Chicago, IL", opened: 1991, capacity: 40615, roof: "Open", tier: "C", color: "#27251F", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/4.png", ticketApproach: "Very good value in the lower bowl. Promotions nights move the floor slightly.", transitNote: "Red Line to Sox 35th is easy. Parking is simple if you drive.", coordinates: { lat: 41.8300, lng: -87.6338 }, specialEvents: ["Dollar dog style promos", "Fireworks Saturdays", "Heritage night packages"] },
    { id: "great-american-ball-park", name: "Great American Ball Park", team: "Cincinnati Reds", city: "Cincinnati, OH", opened: 2003, capacity: 42319, roof: "Open", tier: "B", color: "#C6011F", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/18.png", ticketApproach: "Lower level along third base is often reachable. Good park for short notice planning.", transitNote: "Downtown garages are manageable. Riverfront walk is part of the visit.", coordinates: { lat: 39.0979, lng: -84.5066 }, specialEvents: ["Friday fireworks", "Pete Rose throwback weekends", "Family Sunday giveaways"] },
    { id: "progressive-field", name: "Progressive Field", team: "Cleveland Guardians", city: "Cleveland, OH", opened: 1994, capacity: 34830, roof: "Open", tier: "B", color: "#E31937", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/5.png", ticketApproach: "Club and lower infield seats can dip on resale near first pitch.", transitNote: "Walkable from downtown hotels. RTA to Tower City keeps things simple.", coordinates: { lat: 41.4962, lng: -81.6852 }, specialEvents: ["District ticket nights", "Friday fireworks", "Kids club Sundays"] },
    { id: "coors-field", name: "Coors Field", team: "Colorado Rockies", city: "Denver, CO", opened: 1995, capacity: 50144, roof: "Open", tier: "A", color: "#33006F", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/19.png", ticketApproach: "Purple Row is a classic value move. Premium games still have plenty of supply.", transitNote: "Union Station makes the park easy on foot. Weather can swing fast after sunset.", coordinates: { lat: 39.7561, lng: -104.9942 }, specialEvents: ["Fireworks nights", "Mile High purple row focus", "Concert series weekends"] },
    { id: "comerica-park", name: "Comerica Park", team: "Detroit Tigers", city: "Detroit, MI", opened: 2000, capacity: 41083, roof: "Open", tier: "B", color: "#0C2340", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/6.png", ticketApproach: "Seats are usually available. Buy for shade in midsummer day games.", transitNote: "Walkable from downtown. Parking decks near the district are straightforward.", coordinates: { lat: 42.3390, lng: -83.0485 }, specialEvents: ["Friday fireworks", "Kids run the bases", "Vintage Tigers promo nights"] },
    { id: "minute-maid-park", name: "Minute Maid Park", team: "Houston Astros", city: "Houston, TX", opened: 2000, capacity: 41168, roof: "Retractable", tier: "B", color: "#EB6E1F", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/14.png", ticketApproach: "Watch roof status and opponent. Crawford Boxes premium stays firm.", transitNote: "METRORail works from downtown. Summer heat makes parking less painful than walking far.", coordinates: { lat: 29.7573, lng: -95.3555 }, specialEvents: ["Postgame concerts", "Replica ring giveaways", "Sunday family days"] },
    { id: "kauffman-stadium", name: "Kauffman Stadium", team: "Kansas City Royals", city: "Kansas City, MO", opened: 1973, capacity: 37903, roof: "Open", tier: "A", color: "#004687", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/7.png", ticketApproach: "Excellent lower bowl value. Buy for the fountains side if possible.", transitNote: "This is a car park. Budget parking and a short walk from the lots.", coordinates: { lat: 39.0517, lng: -94.4803 }, specialEvents: ["Fountain themed promos", "Friday fireworks", "Hall of Fame weekends"] },
    { id: "angel-stadium", name: "Angel Stadium", team: "Los Angeles Angels", city: "Anaheim, CA", opened: 1966, capacity: 45517, roof: "Open", tier: "C", color: "#BA0021", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/3.png", ticketApproach: "Easy to buy late. Lower level behind home often stays accessible.", transitNote: "Driving is simplest. ARTIC rail stop can work with planning.", coordinates: { lat: 33.8003, lng: -117.8827 }, specialEvents: ["Ohtani legacy demand dates", "Fireworks nights", "Theme night packages"] },
    { id: "dodger-stadium", name: "Dodger Stadium", team: "Los Angeles Dodgers", city: "Los Angeles, CA", opened: 1962, capacity: 56000, roof: "Open", tier: "A", color: "#005A9C", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/20.png", ticketApproach: "High demand park. Buy early for rivalry games. Reserve level still plays well.", transitNote: "Dodger Stadium Express is useful. Parking exits can be the longest leg of the night.", coordinates: { lat: 34.0739, lng: -118.2400 }, specialEvents: ["Opening weekend premium", "Hello Kitty nights", "Postseason atmosphere tax"] },
    { id: "loandepot-park", name: "loanDepot park", team: "Miami Marlins", city: "Miami, FL", opened: 2012, capacity: 36742, roof: "Retractable", tier: "C", color: "#00A3E0", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/21.png", ticketApproach: "Very buyable late. Good park for spontaneous lower bowl seats.", transitNote: "Rideshare is easiest. Heat and rain make indoor routes matter.", coordinates: { lat: 25.7781, lng: -80.2197 }, specialEvents: ["Heritage celebrations", "Bark at the Park", "Friday concerts"] },
    { id: "american-family-field", name: "American Family Field", team: "Milwaukee Brewers", city: "Milwaukee, WI", opened: 2001, capacity: 41900, roof: "Retractable", tier: "C", color: "#12284B", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/22.png", ticketApproach: "Good secondary market. Tailgate crowd means weekday deals can be strong.", transitNote: "Driving and tailgating are core to the experience. Shuttles from bars are the smart move.", coordinates: { lat: 43.0280, lng: -87.9712 }, specialEvents: ["Tailgate heavy weekends", "Bob Uecker tribute nights", "Sunday autograph sessions"] },
    { id: "target-field", name: "Target Field", team: "Minnesota Twins", city: "Minneapolis, MN", opened: 2010, capacity: 38544, roof: "Open", tier: "B", color: "#002B5C", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/8.png", ticketApproach: "Weather drives the market. Cool night games often soften quickly.", transitNote: "Target Field Station is ideal. Transit is one of the park’s best strengths.", coordinates: { lat: 44.9817, lng: -93.2776 }, specialEvents: ["Home opener demand", "City Connect dates", "Summer concert nights"] },
    { id: "citi-field", name: "Citi Field", team: "New York Mets", city: "New York, NY", opened: 2009, capacity: 41922, roof: "Open", tier: "B", color: "#002D72", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/23.png", ticketApproach: "Weeknight inventory is usually healthy. Pick sections for skyline angle and food access.", transitNote: "7 train to Mets Willets Point is direct and painless on the way in.", coordinates: { lat: 40.7571, lng: -73.8458 }, specialEvents: ["Bobblehead frenzy dates", "Theme night jerseys", "Summer fireworks"] },
    { id: "yankee-stadium", name: "Yankee Stadium", team: "New York Yankees", city: "New York, NY", opened: 2009, capacity: 54251, roof: "Open", tier: "B", color: "#003087", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/9.png", ticketApproach: "Demand spikes fast for rivals. Upper deck can still deliver the history at a sane price.", transitNote: "4 train and Metro North both work. Crowds after the game move fast but stay dense.", coordinates: { lat: 40.8296, lng: -73.9262 }, specialEvents: ["Old Timers style dates", "Judge milestone chase nights", "Monument Park early entry"] },
    { id: "sutter-health-park", name: "Sutter Health Park", team: "Athletics", city: "Sacramento, CA", opened: 2000, capacity: 14014, roof: "Open", tier: "B", color: "#003831", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/10.png", ticketApproach: "Small venue means premium dates can tighten quickly. Buy early if novelty is high.", transitNote: "Plan for car travel. River walk is a good pregame move if timing works.", coordinates: { lat: 38.5806, lng: -121.5131 }, specialEvents: ["Opening season novelty dates", "Minor league crossover nights", "River Cats shared event windows"] },
    { id: "citizens-bank-park", name: "Citizens Bank Park", team: "Philadelphia Phillies", city: "Philadelphia, PA", opened: 2004, capacity: 42792, roof: "Open", tier: "S", color: "#E81828", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/24.png", ticketApproach: "Good lower level value on weeknights. Premium weekends move quickly.", transitNote: "Broad Street Line to NRG Station is the cleanest route. Parking is simple if you need the car.", coordinates: { lat: 39.9061, lng: -75.1665 }, specialEvents: ["Dollar dog legacy nights", "Postgame fireworks", "Red October premium dates"] },
    { id: "pnc-park", name: "PNC Park", team: "Pittsburgh Pirates", city: "Pittsburgh, PA", opened: 2001, capacity: 38747, roof: "Open", tier: "S", color: "#FDB827", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/25.png", ticketApproach: "Value is strong almost everywhere. Spend a little more for first base views if you can.", transitNote: "Walk the Roberto Clemente Bridge if it is closed to cars. North Shore light rail is easy.", coordinates: { lat: 40.4469, lng: -80.0057 }, specialEvents: ["Friday fireworks", "Bridge walk game days", "Pirates Hall of Fame weekends"] },
    { id: "petco-park", name: "Petco Park", team: "San Diego Padres", city: "San Diego, CA", opened: 2004, capacity: 40162, roof: "Open", tier: "A", color: "#2F241D", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/27.png", ticketApproach: "Demand runs hotter now. Midweek still gives you a shot at decent resale.", transitNote: "Gaslamp is fully walkable. Trolley works well if you stay central.", coordinates: { lat: 32.7073, lng: -117.1566 }, specialEvents: ["Theme night jerseys", "Military appreciation weekends", "Friday party deck demand"] },
    { id: "oracle-park", name: "Oracle Park", team: "San Francisco Giants", city: "San Francisco, CA", opened: 2000, capacity: 41915, roof: "Open", tier: "A", color: "#FD5A1E", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/28.png", ticketApproach: "Value varies with weather and opponent. Arcade and view seats are worth watching.", transitNote: "Caltrain and Muni both make this one easy. Dress for wind even on a warm day.", coordinates: { lat: 37.7786, lng: -122.3893 }, specialEvents: ["Splash hit hunt dates", "City Connect weekends", "Postgame concerts"] },
    { id: "t-mobile-park", name: "T-Mobile Park", team: "Seattle Mariners", city: "Seattle, WA", opened: 1999, capacity: 47929, roof: "Retractable", tier: "A", color: "#0C2C56", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/11.png", ticketApproach: "Good variety of price points. Roof uncertainty can create late deals.", transitNote: "Link light rail and Pioneer Square walking route both work. Roof close days change the feel.", coordinates: { lat: 47.5914, lng: -122.3325 }, specialEvents: ["Bark at the Park", "Fireworks nights", "Julio giveaway dates"] },
    { id: "busch-stadium", name: "Busch Stadium", team: "St. Louis Cardinals", city: "St. Louis, MO", opened: 2006, capacity: 44494, roof: "Open", tier: "B", color: "#C41E3A", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/26.png", ticketApproach: "Strong value if you avoid Cubs weekends. Choose seats with Arch views in mind.", transitNote: "MetroLink Stadium stop is direct. Ballpark Village fills early on busy dates.", coordinates: { lat: 38.6226, lng: -90.1928 }, specialEvents: ["Opening Day civic event", "Friday live music", "Hall of Fame induction weekends"] },
    { id: "tropicana-field", name: "Tropicana Field", team: "Tampa Bay Rays", city: "St. Petersburg, FL", opened: 1990, capacity: 25000, roof: "Fixed", tier: "C", color: "#092C5C", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/15.png", ticketApproach: "Usually easy to buy late. Good stop for completion logic before the next park era begins.", transitNote: "Car and parking remain the practical choice. Heat outside makes timing matter.", coordinates: { lat: 27.7683, lng: -82.6534 }, specialEvents: ["Farewell season novelty", "City Connect nights", "Weekend kids run"] },
    { id: "globe-life-field", name: "Globe Life Field", team: "Texas Rangers", city: "Arlington, TX", opened: 2020, capacity: 40518, roof: "Retractable", tier: "B", color: "#003278", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/12.png", ticketApproach: "Prices vary sharply by opponent. Roof certainty makes this easier to plan months ahead.", transitNote: "Driving is standard. Build parking time into any double header style day.", coordinates: { lat: 32.7473, lng: -97.0847 }, specialEvents: ["World Series banner dates", "Concert crossovers", "Replica giveaway weekends"] },
    { id: "rogers-centre", name: "Rogers Centre", team: "Toronto Blue Jays", city: "Toronto, ON", opened: 1989, capacity: 49282, roof: "Retractable", tier: "B", color: "#134A8E", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/13.png", ticketApproach: "Exchange rate and weekend demand matter. Outfield social spaces can be the value move.", transitNote: "Union Station makes this one easy. Roof open versus closed changes the entire visit.", coordinates: { lat: 43.6414, lng: -79.3894 }, specialEvents: ["Canada Day demand", "Jr. Jays Sundays", "Roof open summer weekends"] },
    { id: "nationals-park", name: "Nationals Park", team: "Washington Nationals", city: "Washington, DC", opened: 2008, capacity: 41313, roof: "Open", tier: "B", color: "#AB0003", logo: "https://a.espncdn.com/i/teamlogos/mlb/500/30.png", ticketApproach: "Good availability outside marquee series. Buy for shade in peak summer.", transitNote: "Navy Yard Metro stop is excellent. Riverfront path is a good pregame walk.", coordinates: { lat: 38.8730, lng: -77.0074 }, specialEvents: ["Cherry blossom timing", "Presidents race theme nights", "Postgame concerts"] }
  ];

  var SEEDED_VISITS = [];

  function createDefaultActiveTrip() {
    return {
      id: createId("trip"),
      title: "Next Ballpark Run",
      parkIds: [],
      legs: [],
      startDate: null,
      endDate: null,
      notes: "",
      updatedAt: isoNow()
    };
  }

  function validateNoteScope(scope) {
    if (!VALID_NOTE_SCOPES.includes(scope)) {
      throw new TypeError("Planning note scope must be park, leg, or trip");
    }
  }

  function normalizeNotes(rawNotes) {
    if (!Array.isArray(rawNotes)) return [];
    return rawNotes.filter(function keepValid(entry) {
      return entry && VALID_NOTE_SCOPES.includes(entry.scope) && typeof entry.scopeId === "string";
    });
  }

  function initializeParks() {
    var parks = storage.get(KEYS.parks);
    if (Array.isArray(parks) && parks.length) {
      return cloneValue(parks);
    }

    storage.set(KEYS.parks, SEEDED_PARKS);
    return cloneValue(SEEDED_PARKS);
  }

  function initializeActiveTrip() {
    var activeTrip = storage.get(KEYS.activeTrip);
    if (activeTrip && typeof activeTrip === "object" && Array.isArray(activeTrip.parkIds)) {
      return cloneValue(activeTrip);
    }

    var seededTrip = createDefaultActiveTrip();
    storage.set(KEYS.activeTrip, seededTrip);
    return cloneValue(seededTrip);
  }

  function initializeVisits() {
    var visits = storage.get(KEYS.visits);
    if (Array.isArray(visits)) {
      var normalizedVisits = visits.map(function normalizeVisit(visit) {
        if (!visit || typeof visit !== "object") return visit;
        if (visit.parkId === "oakland-coliseum") {
          var nextVisit = cloneValue(visit);
          nextVisit.parkId = "sutter-health-park";
          return nextVisit;
        }
        return visit;
      });
      storage.set(KEYS.visits, normalizedVisits);
      return cloneValue(normalizedVisits);
    }

    storage.set(KEYS.visits, SEEDED_VISITS);
    return cloneValue(SEEDED_VISITS);
  }

  function initializePlanningNotes() {
    var notes = normalizeNotes(storage.get(KEYS.planningNotes));
    if (notes.length || Array.isArray(storage.get(KEYS.planningNotes))) {
      storage.set(KEYS.planningNotes, notes);
      return cloneValue(notes);
    }

    storage.set(KEYS.planningNotes, []);
    return [];
  }

  function initializeData() {
    return {
      parks: initializeParks(),
      activeTrip: initializeActiveTrip(),
      visits: initializeVisits(),
      planningNotes: initializePlanningNotes()
    };
  }

  function getNotes(scope, scopeId) {
    validateNoteScope(scope);

    var normalizedScopeId = String(scopeId);
    return normalizeNotes(storage.get(KEYS.planningNotes))
      .filter(function byScope(entry) {
        return entry.scope === scope && entry.scopeId === normalizedScopeId;
      })
      .sort(function byUpdatedAt(a, b) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .map(cloneValue);
  }

  function saveNote(scope, scopeId, text) {
    validateNoteScope(scope);

    var normalizedScopeId = String(scopeId);
    var normalizedText = String(text || "").trim();
    var timestamp = isoNow();
    var savedNote = null;

    storage.update(KEYS.planningNotes, function updateNotes(currentNotes) {
      var notes = normalizeNotes(currentNotes);
      var existing = notes.find(function match(entry) {
        return entry.scope === scope && entry.scopeId === normalizedScopeId;
      });

      if (!normalizedText) {
        return notes.filter(function remove(entry) {
          return !(entry.scope === scope && entry.scopeId === normalizedScopeId);
        });
      }

      if (existing) {
        existing.text = normalizedText;
        existing.updatedAt = timestamp;
        savedNote = cloneValue(existing);
        return notes;
      }

      savedNote = {
        id: createId("note"),
        scope: scope,
        scopeId: normalizedScopeId,
        text: normalizedText,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      notes.push(savedNote);
      return notes;
    });

    return savedNote ? cloneValue(savedNote) : null;
  }

  function getParks() {
    return cloneValue(initializeParks());
  }

  function getVisits() {
    return cloneValue(initializeVisits());
  }

  function getActiveTrip() {
    return cloneValue(initializeActiveTrip());
  }

  initializeData();

  namespace.data = {
    KEYS: KEYS,
    SEEDED_PARKS: cloneValue(SEEDED_PARKS),
    initializeData: initializeData,
    getParks: getParks,
    getVisits: getVisits,
    getActiveTrip: getActiveTrip,
    getNotes: getNotes,
    saveNote: saveNote
  };
})(window);
