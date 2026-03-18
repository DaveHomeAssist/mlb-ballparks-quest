(function attachLogosModule(global) {
  "use strict";

  var TEAM_LOGOS = {
    "Arizona Diamondbacks": "assets/logos/arizona-diamondbacks.png",
    "Atlanta Braves": "assets/logos/atlanta-braves.png",
    "Baltimore Orioles": "assets/logos/baltimore-orioles.png",
    "Boston Red Sox": "assets/logos/boston-red-sox.png",
    "Chicago Cubs": "assets/logos/chicago-cubs.png",
    "Chicago White Sox": "assets/logos/chicago-white-sox.png",
    "Cincinnati Reds": "assets/logos/cincinnati-reds.png",
    "Cleveland Guardians": "assets/logos/cleveland-guardians.png",
    "Colorado Rockies": "assets/logos/colorado-rockies.png",
    "Detroit Tigers": "assets/logos/detroit-tigers.png",
    "Houston Astros": "assets/logos/houston-astros.png",
    "Kansas City Royals": "assets/logos/kansas-city-royals.png",
    "Los Angeles Angels": "assets/logos/los-angeles-angels.png",
    "Los Angeles Dodgers": "assets/logos/los-angeles-dodgers.png",
    "Miami Marlins": "assets/logos/miami-marlins.png",
    "Milwaukee Brewers": "assets/logos/milwaukee-brewers.png",
    "Minnesota Twins": "assets/logos/minnesota-twins.png",
    "New York Mets": "assets/logos/new-york-mets.png",
    "New York Yankees": "assets/logos/new-york-yankees.png",
    "Athletics": "assets/logos/athletics.png",
    "Oakland Athletics": "assets/logos/athletics.png",
    "Philadelphia Phillies": "assets/logos/philadelphia-phillies.png",
    "Pittsburgh Pirates": "assets/logos/pittsburgh-pirates.png",
    "San Diego Padres": "assets/logos/san-diego-padres.png",
    "San Francisco Giants": "assets/logos/san-francisco-giants.png",
    "Seattle Mariners": "assets/logos/seattle-mariners.png",
    "St. Louis Cardinals": "assets/logos/st-louis-cardinals.png",
    "Tampa Bay Rays": "assets/logos/tampa-bay-rays.png",
    "Texas Rangers": "assets/logos/texas-rangers.png",
    "Toronto Blue Jays": "assets/logos/toronto-blue-jays.png",
    "Washington Nationals": "assets/logos/washington-nationals.png",
    "LA Angels": "assets/logos/los-angeles-angels.png",
    "NY Yankees": "assets/logos/new-york-yankees.png"
  };

  function getTeamLogo(name) {
    return TEAM_LOGOS[name] || "";
  }

  global.BPQ = global.BPQ || {};
  global.BPQ.logos = {
    getTeamLogo: getTeamLogo
  };
})(window);
