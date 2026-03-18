/* schedule.js — 2026 MLB home-game schedules & lookup helpers
   Namespace: BPQ.schedule                                        */
(function (global) {
  "use strict";

  global.BPQ = global.BPQ || {};

  /* ── team-name → park-id mapping (mirrors data.js SEEDED_PARKS) ── */
  var TEAM_TO_PARK = {
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
    "Atlanta Braves":          "truist-park",
    "New York Mets":           "citi-field",
    "Washington Nationals":    "nationals-park",
    "Miami Marlins":           "loandepot-park",
    "Chicago Cubs":            "wrigley-field",
    "Cincinnati Reds":         "great-american-ball-park",
    "Milwaukee Brewers":       "american-family-field",
    "Pittsburgh Pirates":      "pnc-park",
    "St. Louis Cardinals":     "busch-stadium",
    "Arizona Diamondbacks":    "chase-field",
    "Colorado Rockies":        "coors-field",
    "Los Angeles Dodgers":     "dodger-stadium",
    "San Diego Padres":        "petco-park",
    "San Francisco Giants":    "oracle-park"
  };

  /* ── 2026 schedule data, keyed by park-id ── */
  var SCHEDULE_2026 = {

    /* ─── Yankee Stadium ─── */
    "yankee-stadium": [
      {d:"2026-04-03",y:"Fri",t:"1:35 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-04-04",y:"Sat",t:"7:05 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-04-05",y:"Sun",t:"1:35 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-04-07",y:"Tue",t:"7:05 PM",o:"Athletics",s:"",h:false},
      {d:"2026-04-08",y:"Wed",t:"7:05 PM",o:"Athletics",s:"",h:false},
      {d:"2026-04-09",y:"Thu",t:"1:35 PM",o:"Athletics",s:"",h:false},
      {d:"2026-04-13",y:"Mon",t:"7:05 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-04-14",y:"Tue",t:"7:05 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-04-15",y:"Wed",t:"7:05 PM",o:"Los Angeles Angels",s:"Jackie Robinson Day",h:false},
      {d:"2026-04-16",y:"Thu",t:"1:35 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-04-17",y:"Fri",t:"7:05 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-04-18",y:"Sat",t:"1:35 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-04-19",y:"Sun",t:"1:35 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-05-01",y:"Fri",t:"7:05 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-05-02",y:"Sat",t:"1:35 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-05-03",y:"Sun",t:"1:35 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-05-04",y:"Mon",t:"7:05 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-05-05",y:"Tue",t:"7:05 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-05-06",y:"Wed",t:"7:05 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-05-07",y:"Thu",t:"12:35 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-05-18",y:"Mon",t:"7:05 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-05-19",y:"Tue",t:"7:05 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-05-20",y:"Wed",t:"7:05 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-05-21",y:"Thu",t:"7:05 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-05-22",y:"Fri",t:"7:05 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-05-23",y:"Sat",t:"1:35 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-05-24",y:"Sun",t:"1:35 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-06-02",y:"Tue",t:"7:05 PM",o:"Cleveland Guardians",s:"Lou Gehrig Day",h:false},
      {d:"2026-06-03",y:"Wed",t:"7:05 PM",o:"Cleveland Guardians",s:"",h:false},
      {d:"2026-06-04",y:"Thu",t:"1:35 PM",o:"Cleveland Guardians",s:"",h:false},
      {d:"2026-06-05",y:"Fri",t:"7:05 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-06-06",y:"Sat",t:"7:35 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-06-07",y:"Sun",t:"1:35 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-06-16",y:"Tue",t:"7:05 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-17",y:"Wed",t:"7:05 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-18",y:"Thu",t:"7:05 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-19",y:"Fri",t:"7:05 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-06-20",y:"Sat",t:"1:35 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-06-21",y:"Sun",t:"1:35 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-06-29",y:"Mon",t:"7:05 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-06-30",y:"Tue",t:"7:05 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-07-01",y:"Wed",t:"1:35 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-07-03",y:"Fri",t:"7:05 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-04",y:"Sat",t:"1:35 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-05",y:"Sun",t:"1:35 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-17",y:"Fri",t:"7:05 PM",o:"Los Angeles Dodgers",s:"",h:false},
      {d:"2026-07-18",y:"Sat",t:"8:08 PM",o:"Los Angeles Dodgers",s:"",h:false},
      {d:"2026-07-19",y:"Sun",t:"7:20 PM",o:"Los Angeles Dodgers",s:"",h:false},
      {d:"2026-07-20",y:"Mon",t:"7:05 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-07-21",y:"Tue",t:"7:05 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-07-22",y:"Wed",t:"1:35 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-08-03",y:"Mon",t:"7:05 PM",o:"St. Louis Cardinals",s:"",h:false},
      {d:"2026-08-04",y:"Tue",t:"7:05 PM",o:"St. Louis Cardinals",s:"",h:false},
      {d:"2026-08-05",y:"Wed",t:"7:05 PM",o:"St. Louis Cardinals",s:"",h:false},
      {d:"2026-08-07",y:"Fri",t:"7:05 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-08-08",y:"Sat",t:"3:05 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-08-09",y:"Sun",t:"1:35 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-08-11",y:"Tue",t:"7:05 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-08-12",y:"Wed",t:"7:05 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-08-13",y:"Thu",t:"1:35 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-08-21",y:"Fri",t:"7:05 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-08-22",y:"Sat",t:"1:35 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-08-23",y:"Sun",t:"1:35 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-08-25",y:"Tue",t:"7:05 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-08-26",y:"Wed",t:"7:05 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-08-27",y:"Thu",t:"7:05 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-08-28",y:"Fri",t:"7:05 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-08-29",y:"Sat",t:"7:15 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-08-30",y:"Sun",t:"1:35 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-09-08",y:"Tue",t:"7:05 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-09-09",y:"Wed",t:"7:05 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-09-10",y:"Thu",t:"7:05 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-09-11",y:"Fri",t:"7:05 PM",o:"New York Mets",s:"9/11 25th Anniversary Series",h:false},
      {d:"2026-09-12",y:"Sat",t:"1:35 PM",o:"New York Mets",s:"9/11 25th Anniversary Series",h:false},
      {d:"2026-09-13",y:"Sun",t:"1:35 PM",o:"New York Mets",s:"9/11 25th Anniversary Series",h:false},
      {d:"2026-09-22",y:"Tue",t:"7:05 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-09-23",y:"Wed",t:"7:05 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-09-24",y:"Thu",t:"7:05 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-09-25",y:"Fri",t:"7:05 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-09-26",y:"Sat",t:"7:05 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-09-27",y:"Sun",t:"3:20 PM",o:"Baltimore Orioles",s:"",h:false}
    ],

    /* ─── Progressive Field ─── */
    "progressive-field": [
      {d:"2026-04-03",y:"Fri",t:"4:10 PM",o:"Chicago Cubs",s:"",h:false},
      {d:"2026-04-04",y:"Sat",t:"7:15 PM",o:"Chicago Cubs",s:"",h:false},
      {d:"2026-04-05",y:"Sun",t:"1:40 PM",o:"Chicago Cubs",s:"",h:false},
      {d:"2026-04-06",y:"Mon",t:"6:10 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-04-07",y:"Tue",t:"6:10 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-04-08",y:"Wed",t:"1:10 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-04-16",y:"Thu",t:"6:10 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-04-17",y:"Fri",t:"6:10 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-04-18",y:"Sat",t:"6:10 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-04-19",y:"Sun",t:"1:40 PM",o:"Baltimore Orioles",s:"",h:false},
      {d:"2026-04-20",y:"Mon",t:"6:10 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-04-21",y:"Tue",t:"6:10 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-04-22",y:"Wed",t:"1:10 PM",o:"Houston Astros",s:"",h:false},
      {d:"2026-04-27",y:"Mon",t:"6:10 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-04-28",y:"Tue",t:"6:10 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-04-29",y:"Wed",t:"1:10 PM",o:"Tampa Bay Rays",s:"",h:false},
      {d:"2026-05-08",y:"Fri",t:"7:10 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-05-09",y:"Sat",t:"6:10 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-05-10",y:"Sun",t:"1:40 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-05-11",y:"Mon",t:"6:10 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-05-12",y:"Tue",t:"6:10 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-05-13",y:"Wed",t:"1:10 PM",o:"Los Angeles Angels",s:"",h:false},
      {d:"2026-05-15",y:"Fri",t:"7:10 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-16",y:"Sat",t:"6:10 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-17",y:"Sun",t:"1:40 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-25",y:"Mon",t:"6:10 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-05-26",y:"Tue",t:"6:10 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-05-27",y:"Wed",t:"1:10 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-05-29",y:"Fri",t:"7:10 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-05-30",y:"Sat",t:"4:10 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-05-31",y:"Sun",t:"1:40 PM",o:"Boston Red Sox",s:"",h:false},
      {d:"2026-06-08",y:"Mon",t:"6:40 PM",o:"New York Yankees",s:"",h:false},
      {d:"2026-06-09",y:"Tue",t:"6:40 PM",o:"New York Yankees",s:"",h:false},
      {d:"2026-06-10",y:"Wed",t:"1:10 PM",o:"New York Yankees",s:"",h:false},
      {d:"2026-06-12",y:"Fri",t:"7:10 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-06-13",y:"Sat",t:"4:10 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-06-14",y:"Sun",t:"1:40 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-06-26",y:"Fri",t:"7:10 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-06-27",y:"Sat",t:"7:10 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-06-28",y:"Sun",t:"1:40 PM",o:"Seattle Mariners",s:"",h:false},
      {d:"2026-06-29",y:"Mon",t:"7:10 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-06-30",y:"Tue",t:"6:40 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-07-01",y:"Wed",t:"1:10 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-07-02",y:"Thu",t:"6:40 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-07-03",y:"Fri",t:"7:10 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-07-04",y:"Sat",t:"7:10 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-07-05",y:"Sun",t:"2:00 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-07-17",y:"Fri",t:"7:10 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-07-18",y:"Sat",t:"4:10 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-07-19",y:"Sun",t:"1:40 PM",o:"Pittsburgh Pirates",s:"",h:false},
      {d:"2026-07-20",y:"Mon",t:"6:40 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-21",y:"Tue",t:"6:40 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-22",y:"Wed",t:"6:40 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-23",y:"Thu",t:"1:10 PM",o:"Minnesota Twins",s:"",h:false},
      {d:"2026-07-31",y:"Fri",t:"7:10 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-08-01",y:"Sat",t:"7:15 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-08-02",y:"Sun",t:"1:40 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-08-04",y:"Tue",t:"6:40 PM",o:"New York Mets",s:"",h:false},
      {d:"2026-08-05",y:"Wed",t:"6:40 PM",o:"New York Mets",s:"",h:false},
      {d:"2026-08-06",y:"Thu",t:"1:10 PM",o:"New York Mets",s:"",h:false},
      {d:"2026-08-14",y:"Fri",t:"7:10 PM",o:"San Diego Padres",s:"",h:false},
      {d:"2026-08-15",y:"Sat",t:"7:10 PM",o:"San Diego Padres",s:"",h:false},
      {d:"2026-08-16",y:"Sun",t:"1:40 PM",o:"San Diego Padres",s:"",h:false},
      {d:"2026-08-18",y:"Tue",t:"6:40 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-08-19",y:"Wed",t:"6:40 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-08-20",y:"Thu",t:"1:10 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-08-28",y:"Fri",t:"7:10 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-08-29",y:"Sat",t:"4:10 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-08-30",y:"Sun",t:"1:40 PM",o:"Kansas City Royals",s:"",h:false},
      {d:"2026-09-01",y:"Tue",t:"6:40 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-09-02",y:"Wed",t:"6:40 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-09-03",y:"Thu",t:"1:10 PM",o:"Toronto Blue Jays",s:"",h:false},
      {d:"2026-09-04",y:"Fri",t:"7:10 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-09-05",y:"Sat",t:"7:15 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-09-06",y:"Sun",t:"1:40 PM",o:"Detroit Tigers",s:"",h:false},
      {d:"2026-09-14",y:"Mon",t:"6:40 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-09-15",y:"Tue",t:"6:40 PM",o:"Chicago White Sox",s:"Roberto Clemente Day",h:false},
      {d:"2026-09-16",y:"Wed",t:"1:10 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-09-18",y:"Fri",t:"7:10 PM",o:"Athletics",s:"",h:false},
      {d:"2026-09-19",y:"Sat",t:"6:10 PM",o:"Athletics",s:"",h:false},
      {d:"2026-09-20",y:"Sun",t:"1:40 PM",o:"Athletics",s:"",h:false}
    ],

    /* ─── Citizens Bank Park ─── */
    "citizens-bank-park": [
      {d:"2026-03-26",y:"Thu",t:"4:15 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-03-28",y:"Sat",t:"4:05 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-03-29",y:"Sun",t:"1:35 PM",o:"Texas Rangers",s:"",h:false},
      {d:"2026-03-30",y:"Mon",t:"6:40 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-03-31",y:"Tue",t:"6:40 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-04-01",y:"Wed",t:"1:05 PM",o:"Washington Nationals",s:"",h:false},
      {d:"2026-04-10",y:"Fri",t:"6:40 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-04-11",y:"Sat",t:"1:05 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-04-12",y:"Sun",t:"1:35 PM",o:"Arizona Diamondbacks",s:"",h:false},
      {d:"2026-04-13",y:"Mon",t:"6:40 PM",o:"Chicago Cubs",s:"",h:false},
      {d:"2026-04-14",y:"Tue",t:"6:40 PM",o:"Chicago Cubs",s:"",h:false},
      {d:"2026-04-15",y:"Wed",t:"6:40 PM",o:"Chicago Cubs",s:"Jackie Robinson Day",h:false},
      {d:"2026-04-17",y:"Fri",t:"6:40 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-04-18",y:"Sat",t:"7:15 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-04-19",y:"Sun",t:"7:20 PM",o:"Atlanta Braves",s:"",h:false},
      {d:"2026-04-28",y:"Tue",t:"6:40 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-04-29",y:"Wed",t:"6:40 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-04-30",y:"Thu",t:"1:05 PM",o:"San Francisco Giants",s:"",h:false},
      {d:"2026-05-05",y:"Tue",t:"6:40 PM",o:"Athletics",s:"",h:false},
      {d:"2026-05-06",y:"Wed",t:"6:40 PM",o:"Athletics",s:"",h:false},
      {d:"2026-05-07",y:"Thu",t:"6:40 PM",o:"Athletics",s:"",h:false},
      {d:"2026-05-08",y:"Fri",t:"6:40 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-05-09",y:"Sat",t:"6:05 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-05-10",y:"Sun",t:"1:35 PM",o:"Colorado Rockies",s:"",h:false},
      {d:"2026-05-18",y:"Mon",t:"6:40 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-19",y:"Tue",t:"6:40 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-20",y:"Wed",t:"1:05 PM",o:"Cincinnati Reds",s:"",h:false},
      {d:"2026-05-22",y:"Fri",t:"6:40 PM",o:"Cleveland Guardians",s:"",h:false},
      {d:"2026-05-23",y:"Sat",t:"4:05 PM",o:"Cleveland Guardians",s:"",h:false},
      {d:"2026-05-24",y:"Sun",t:"1:35 PM",o:"Cleveland Guardians",s:"",h:false},
      {d:"2026-06-02",y:"Tue",t:"6:40 PM",o:"San Diego Padres",s:"Lou Gehrig Day",h:false},
      {d:"2026-06-03",y:"Wed",t:"6:40 PM",o:"San Diego Padres",s:"",h:false},
      {d:"2026-06-04",y:"Thu",t:"1:05 PM",o:"San Diego Padres",s:"",h:false},
      {d:"2026-06-05",y:"Fri",t:"6:40 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-06",y:"Sat",t:"4:05 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-07",y:"Sun",t:"1:35 PM",o:"Chicago White Sox",s:"",h:false},
      {d:"2026-06-15",y:"Mon",t:"6:40 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-06-16",y:"Tue",t:"6:40 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-06-17",y:"Wed",t:"1:05 PM",o:"Miami Marlins",s:"",h:false},
      {d:"2026-06-18",y:"Thu",t:"6:40 PM",o:"New York Mets",s:"",h:false}
    ]
  };

  /* ── month names for formatGameLine ── */
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];

  /* ── helper: today as ISO date string ── */
  function todayISO() {
    var n = new Date();
    var mm = String(n.getMonth() + 1).padStart(2, "0");
    var dd = String(n.getDate()).padStart(2, "0");
    return n.getFullYear() + "-" + mm + "-" + dd;
  }

  /* ── shortenTeam: drop city prefix, keep last word(s) ── */
  function shortenTeam(name) {
    var map = {
      "New York Yankees":      "Yankees",
      "New York Mets":         "Mets",
      "Los Angeles Angels":    "Angels",
      "Los Angeles Dodgers":   "Dodgers",
      "Tampa Bay Rays":        "Rays",
      "San Francisco Giants":  "Giants",
      "San Diego Padres":      "Padres",
      "Kansas City Royals":    "Royals",
      "Cleveland Guardians":   "Guardians",
      "Boston Red Sox":        "Red Sox",
      "Chicago White Sox":     "White Sox",
      "Chicago Cubs":          "Cubs",
      "St. Louis Cardinals":   "Cardinals",
      "Toronto Blue Jays":     "Blue Jays",
      "Baltimore Orioles":     "Orioles",
      "Philadelphia Phillies": "Phillies",
      "Washington Nationals":  "Nationals",
      "Miami Marlins":         "Marlins",
      "Houston Astros":        "Astros",
      "Texas Rangers":         "Rangers",
      "Seattle Mariners":      "Mariners",
      "Minnesota Twins":       "Twins",
      "Detroit Tigers":        "Tigers",
      "Cincinnati Reds":       "Reds",
      "Milwaukee Brewers":     "Brewers",
      "Pittsburgh Pirates":    "Pirates",
      "Atlanta Braves":        "Braves",
      "Arizona Diamondbacks":  "Diamondbacks",
      "Colorado Rockies":      "Rockies",
      "Athletics":             "Athletics"
    };
    return map[name] || name;
  }

  /* ── public API ── */

  function getGamesForPark(parkId) {
    return SCHEDULE_2026[parkId] || [];
  }

  function getUpcomingGames(parkId, count) {
    count = count || 3;
    var today = todayISO();
    var games = getGamesForPark(parkId);
    var upcoming = [];
    for (var i = 0; i < games.length; i++) {
      if (games[i].d >= today) {
        upcoming.push(games[i]);
        if (upcoming.length >= count) break;
      }
    }
    return upcoming;
  }

  function getNextGame(parkId) {
    var games = getUpcomingGames(parkId, 1);
    return games.length ? games[0] : null;
  }

  function getGamesInWindow(parkId, startDate, endDate) {
    var games = getGamesForPark(parkId);
    var result = [];
    for (var i = 0; i < games.length; i++) {
      if (games[i].d >= startDate && games[i].d <= endDate) {
        result.push(games[i]);
      }
    }
    return result;
  }

  function formatGameLine(game) {
    // parse date parts from ISO string
    var parts = game.d.split("-");
    var month = MONTHS[parseInt(parts[1], 10) - 1];
    var day   = parseInt(parts[2], 10);
    var short = shortenTeam(game.o);
    return game.y + " " + month + " " + day + " \u00B7 " + game.t + " \u00B7 vs " + short;
  }

  function getTeamCount() {
    var count = 0;
    for (var key in SCHEDULE_2026) {
      if (SCHEDULE_2026.hasOwnProperty(key)) count++;
    }
    return count;
  }

  /* ── attach to namespace ── */
  global.BPQ.schedule = {
    TEAM_TO_PARK:     TEAM_TO_PARK,
    getGamesForPark:  getGamesForPark,
    getUpcomingGames: getUpcomingGames,
    getNextGame:      getNextGame,
    getGamesInWindow: getGamesInWindow,
    formatGameLine:   formatGameLine,
    getTeamCount:     getTeamCount
  };

})(window);
