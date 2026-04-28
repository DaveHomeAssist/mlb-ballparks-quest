(function attachLogosModule(global) {
  "use strict";

  var TEAM_LOGOS = {
    "Arizona Diamondbacks": "logos/arizona-diamondbacks.png",
    "Atlanta Braves": "logos/atlanta-braves.png",
    "Baltimore Orioles": "logos/baltimore-orioles.png",
    "Boston Red Sox": "logos/boston-red-sox.png",
    "Chicago Cubs": "logos/chicago-cubs.png",
    "Chicago White Sox": "logos/chicago-white-sox.png",
    "Cincinnati Reds": "logos/cincinnati-reds.png",
    "Cleveland Guardians": "logos/cleveland-guardians.png",
    "Colorado Rockies": "logos/colorado-rockies.png",
    "Detroit Tigers": "logos/detroit-tigers.png",
    "Houston Astros": "logos/houston-astros.png",
    "Kansas City Royals": "logos/kansas-city-royals.png",
    "Los Angeles Angels": "logos/los-angeles-angels.png",
    "Los Angeles Dodgers": "logos/los-angeles-dodgers.png",
    "Miami Marlins": "logos/miami-marlins.png",
    "Milwaukee Brewers": "logos/milwaukee-brewers.png",
    "Minnesota Twins": "logos/minnesota-twins.png",
    "New York Mets": "logos/new-york-mets.png",
    "New York Yankees": "logos/new-york-yankees.png",
    "Athletics": "logos/athletics.png",
    "Oakland Athletics": "logos/athletics.png",
    "Philadelphia Phillies": "logos/philadelphia-phillies.png",
    "Pittsburgh Pirates": "logos/pittsburgh-pirates.png",
    "San Diego Padres": "logos/san-diego-padres.png",
    "San Francisco Giants": "logos/san-francisco-giants.png",
    "Seattle Mariners": "logos/seattle-mariners.png",
    "St. Louis Cardinals": "logos/st-louis-cardinals.png",
    "Tampa Bay Rays": "logos/tampa-bay-rays.png",
    "Texas Rangers": "logos/texas-rangers.png",
    "Toronto Blue Jays": "logos/toronto-blue-jays.png",
    "Washington Nationals": "logos/washington-nationals.png",
    "LA Angels": "logos/los-angeles-angels.png",
    "NY Yankees": "logos/new-york-yankees.png"
  };

  function getTeamLogo(name) {
    return TEAM_LOGOS[name] || "";
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.logos = {
    getTeamLogo: getTeamLogo
  };
})(window);
