import { FutureQuestion } from "./types";

export const NFL_TEAMS_ALL = [
  { value: "ARI", label: "Arizona Cardinals", conference: "NFC", division: "NFC West" },
  { value: "ATL", label: "Atlanta Falcons", conference: "NFC", division: "NFC South" },
  { value: "BAL", label: "Baltimore Ravens", conference: "AFC", division: "AFC North" },
  { value: "BUF", label: "Buffalo Bills", conference: "AFC", division: "AFC East" },
  { value: "CAR", label: "Carolina Panthers", conference: "NFC", division: "NFC South" },
  { value: "CHI", label: "Chicago Bears", conference: "NFC", division: "NFC North" },
  { value: "CIN", label: "Cincinnati Bengals", conference: "AFC", division: "AFC North" },
  { value: "CLE", label: "Cleveland Browns", conference: "AFC", division: "AFC North" },
  { value: "DAL", label: "Dallas Cowboys", conference: "NFC", division: "NFC East" },
  { value: "DEN", label: "Denver Broncos", conference: "AFC", division: "AFC West" },
  { value: "DET", label: "Detroit Lions", conference: "NFC", division: "NFC North" },
  { value: "GB", label: "Green Bay Packers", conference: "NFC", division: "NFC North" },
  { value: "HOU", label: "Houston Texans", conference: "AFC", division: "AFC South" },
  { value: "IND", label: "Indianapolis Colts", conference: "AFC", division: "AFC South" },
  { value: "JAX", label: "Jacksonville Jaguars", conference: "AFC", division: "AFC South" },
  { value: "KC", label: "Kansas City Chiefs", conference: "AFC", division: "AFC West" },
  { value: "LV", label: "Las Vegas Raiders", conference: "AFC", division: "AFC West" },
  { value: "LAC", label: "Los Angeles Chargers", conference: "AFC", division: "AFC West" },
  { value: "LAR", label: "Los Angeles Rams", conference: "NFC", division: "NFC West" },
  { value: "MIA", label: "Miami Dolphins", conference: "AFC", division: "AFC East" },
  { value: "MIN", label: "Minnesota Vikings", conference: "NFC", division: "NFC North" },
  { value: "NE", label: "New England Patriots", conference: "AFC", division: "AFC East" },
  { value: "NO", label: "New Orleans Saints", conference: "NFC", division: "NFC South" },
  { value: "NYG", label: "New York Giants", conference: "NFC", division: "NFC East" },
  { value: "NYJ", label: "New York Jets", conference: "AFC", division: "AFC East" },
  { value: "PHI", label: "Philadelphia Eagles", conference: "NFC", division: "NFC East" },
  { value: "PIT", label: "Pittsburgh Steelers", conference: "AFC", division: "AFC North" },
  { value: "SF", label: "San Francisco 49ers", conference: "NFC", division: "NFC West" },
  { value: "SEA", label: "Seattle Seahawks", conference: "NFC", division: "NFC West" },
  { value: "TB", label: "Tampa Bay Buccaneers", conference: "NFC", division: "NFC South" },
  { value: "TEN", label: "Tennessee Titans", conference: "AFC", division: "AFC South" },
  { value: "WAS", label: "Washington Commanders", conference: "NFC", division: "NFC East" },
];

export const AFC_TEAMS = NFL_TEAMS_ALL.filter(t => t.conference === "AFC");
export const NFC_TEAMS = NFL_TEAMS_ALL.filter(t => t.conference === "NFC");

export const NFL_WIN_TOTALS: Record<string, number> = {
  ARI: 7.5,
  ATL: 9.5,
  BAL: 10.5,
  BUF: 10.5,
  CAR: 5.5,
  CHI: 8.5,
  CIN: 10.5,
  CLE: 8.5,
  DAL: 10.5,
  DEN: 5.5,
  DET: 10.5,
  GB: 9.5,
  HOU: 9.5,
  IND: 8.5,
  JAX: 8.5,
  KC: 11.5,
  LV: 6.5,
  LAC: 8.5,
  LAR: 8.5,
  MIA: 9.5,
  MIN: 7.5,
  NE: 4.5,
  NO: 7.5,
  NYG: 6.5,
  NYJ: 9.5,
  PHI: 10.5,
  PIT: 8.5,
  SF: 11.5,
  SEA: 7.5,
  TB: 7.5,
  TEN: 6.5,
  WAS: 6.5
};

export const FUTURES_QUESTIONS: FutureQuestion[] = [
  // 1. Championship & Awards (Huge Points)
  {
    id: "super_bowl",
    category: "award",
    title: "Super Bowl LXI Winner",
    subtitle: "Who will raise the Lombardi Trophy at the end of the 2026-2027 season?",
    points: 25,
    options: NFL_TEAMS_ALL.map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "afc_champ",
    category: "award",
    title: "AFC Champion",
    subtitle: "Which American Football Conference team wins the conference in 2026-2027?",
    points: 15,
    options: AFC_TEAMS.map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "nfc_champ",
    category: "award",
    title: "NFC Champion",
    subtitle: "Which National Football Conference team wins the conference in 2026-2027?",
    points: 15,
    options: NFC_TEAMS.map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "mvp",
    category: "award",
    title: "NFL Regular Season MVP (2026-2027)",
    subtitle: "Associated Press Most Valuable Player Award winner.",
    points: 20,
    options: [
      { value: "patrick_mahomes", label: "Patrick Mahomes (Chiefs)" },
      { value: "josh_allen", label: "Josh Allen (Bills)" },
      { value: "cj_stroud", label: "C.J. Stroud (Texans)" },
      { value: "joe_burrow", label: "Joe Burrow (Bengals)" },
      { value: "lamar_jackson", label: "Lamar Jackson (Ravens)" },
      { value: "jordan_love", label: "Jordan Love (Packers)" },
      { value: "justin_herbert", label: "Justin Herbert (Chargers)" },
      { value: "brock_purdy", label: "Brock Purdy (49ers)" },
      { value: "jalen_hurts", label: "Jalen Hurts (Eagles)" },
      { value: "dak_prescott", label: "Dak Prescott (Cowboys)" },
      { value: "tua_tagovailoa", label: "Tua Tagovailoa (Dolphins)" },
      { value: "jared_goff", label: "Jared Goff (Lions)" },
      { value: "caleb_williams", label: "Caleb Williams (Bears)" },
      { value: "other", label: "Other / Field" },
    ]
  },
  {
    id: "opoy",
    category: "award",
    title: "Regular Season Offensive Player of the Year (OPOY)",
    subtitle: "AP Offensive Player of the Year for 2026-2027.",
    points: 15,
    options: [
      { value: "christian_mccaffrey", label: "Christian McCaffrey (49ers)" },
      { value: "puka_nacua", label: "Puka Nacua (Rams)" },
      { value: "ceedee_lamb", label: "CeeDee Lamb (Cowboys)" },
      { value: "justin_jefferson", label: "Justin Jefferson (Vikings)" },
      { value: "jamarr_chase", label: "Ja'Marr Chase (Bengals)" },
      { value: "amonra_st_brown", label: "Amon-Ra St. Brown (Lions)" },
      { value: "breece_hall", label: "Breece Hall (Jets)" },
      { value: "bijan_robinson", label: "Bijan Robinson (Falcons)" },
      { value: "saquon_barkley", label: "Saquon Barkley (Eagles)" },
      { value: "aj_brown", label: "A.J. Brown (Eagles)" },
      { value: "jahmyr_gibbs", label: "Jahmyr Gibbs (Lions)" },
      { value: "kyren_williams", label: "Kyren Williams (Rams)" },
      { value: "other", label: "Other / Field" },
    ]
  },
  {
    id: "dpoy",
    category: "award",
    title: "Regular Season Defensive Player of the Year (DPOY)",
    subtitle: "AP Defensive Player of the Year for 2026-2027.",
    points: 15,
    options: [
      { value: "micah_parsons", label: "Micah Parsons (Cowboys)" },
      { value: "myles_garrett", label: "Myles Garrett (Browns)" },
      { value: "tj_watt", label: "T.J. Watt (Steelers)" },
      { value: "maxx_crosby", label: "Maxx Crosby (Raiders)" },
      { value: "nick_bosa", label: "Nick Bosa (49ers)" },
      { value: "aidan_hutchinson", label: "Aidan Hutchinson (Lions)" },
      { value: "will_anderson_jr", label: "Will Anderson Jr. (Texans)" },
      { value: "chris_jones", label: "Chris Jones (Chiefs)" },
      { value: "sauce_gardner", label: "Sauce Gardner (Jets)" },
      { value: "fred_warner", label: "Fred Warner (49ers)" },
      { value: "kyle_hamilton", label: "Kyle Hamilton (Ravens)" },
      { value: "other", label: "Other / Field" },
    ]
  },
  {
    id: "oroy",
    category: "award",
    title: "Offensive Rookie of the Year (OROY)",
    subtitle: "AP Offensive Rookie of the Year candidates.",
    points: 10,
    options: [
      { value: "zachariah_branch", label: "Zachariah Branch (Falcons)" },
      { value: "miller_moss", label: "Miller Moss (Bears)" },
      { value: "taylen_green", label: "Taylen Green (Browns)" },
      { value: "luke_altmyer", label: "Luke Altmyer (Lions)" },
      { value: "carnell_tate", label: "Carnell Tate (Titans)" },
      { value: "juice_wells_jr", label: "Juice Wells Jr. (Falcons)" },
      { value: "kyron_drones", label: "Kyron Drones (Packers)" },
      { value: "garrett_nussmeier", label: "Garrett Nussmeier (Chiefs)" },
      { value: "cade_klubnik", label: "Cade Klubnik (Jets)" },
      { value: "nicholas_singleton", label: "Nicholas Singleton (Titans)" },
      { value: "other", label: "Other / Field" }
    ]
  },
  {
    id: "droy",
    category: "award",
    title: "Defensive Rookie of the Year (DROY)",
    subtitle: "AP Defensive Rookie of the Year candidates.",
    points: 10,
    options: [
      { value: "harold_perkins_jr", label: "Harold Perkins Jr. (Falcons)" },
      { value: "caleb_downs", label: "Caleb Downs (Cowboys)" },
      { value: "sonny_styles", label: "Sonny Styles (Commanders)" },
      { value: "walter_nolen", label: "Walter Nolen (Cardinals)" },
      { value: "davison_igbinosun", label: "Davison Igbinosun (Bills)" },
      { value: "tj_parker", label: "TJ Parker (Bills)" },
      { value: "malik_muhammad", label: "Malik Muhammad (Bears)" },
      { value: "kendal_daniels", label: "Kendal Daniels (Falcons)" },
      { value: "zane_durant", label: "Zane Durant (Bills)" },
      { value: "other", label: "Other / Field" }
    ]
  },
  {
    id: "cpoy",
    category: "award",
    title: "Comeback Player of the Year (CPOY)",
    subtitle: "AP NFL Comeback Player of the Year for 2026-2027.",
    points: 10,
    options: [
      { value: "aidan_hutchinson", label: "Aidan Hutchinson (Lions)" },
      { value: "dak_prescott", label: "Dak Prescott (Cowboys)" },
      { value: "deshaun_watson", label: "Deshaun Watson (Browns)" },
      { value: "chris_godwin", label: "Chris Godwin (Buccaneers)" },
      { value: "christian_mccaffrey", label: "Christian McCaffrey (49ers)" },
      { value: "brandon_aiyuk", label: "Brandon Aiyuk (49ers)" },
      { value: "rashee_rice", label: "Rashee Rice (Chiefs)" },
      { value: "garrett_wilson", label: "Garrett Wilson (Jets)" },
      { value: "kirk_cousins", label: "Kirk Cousins (Raiders)" },
      { value: "aaron_rodgers", label: "Aaron Rodgers (Steelers)" },
      { value: "other", label: "Other / Field" },
    ]
  },
  {
    id: "coy",
    category: "award",
    title: "Coach of the Year (COY)",
    subtitle: "AP NFL Coach of the Year for 2026-2027.",
    points: 10,
    options: [
      { value: "ben_johnson", label: "Ben Johnson (Bears)" },
      { value: "jim_harbaugh", label: "Jim Harbaugh (Chargers)" },
      { value: "demeco_ryans", label: "DeMeco Ryans (Texans)" },
      { value: "matt_lafleur", label: "Matt LaFleur (Packers)" },
      { value: "dan_campbell", label: "Dan Campbell (Lions)" },
      { value: "mike_macdonald", label: "Mike Macdonald (Seahawks)" },
      { value: "kevin_oconnell", label: "Kevin O'Connell (Vikings)" },
      { value: "shane_steichen", label: "Shane Steichen (Colts)" },
      { value: "raheem_morris", label: "Raheem Morris (Falcons)" },
      { value: "mike_tomlin", label: "Mike Tomlin (Steelers)" },
      { value: "other", label: "Other / Field" },
    ]
  },

  // 2. Division Winners (10 Points Each)
  {
    id: "div_afc_east",
    category: "division",
    title: "AFC East Champion",
    subtitle: "Who wins the AFC East division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC East").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_afc_north",
    category: "division",
    title: "AFC North Champion",
    subtitle: "Who wins the AFC North division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC North").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_afc_south",
    category: "division",
    title: "AFC South Champion",
    subtitle: "Who wins the AFC South division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC South").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_afc_west",
    category: "division",
    title: "AFC West Champion",
    subtitle: "Who wins the AFC West division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC West").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_nfc_east",
    category: "division",
    title: "NFC East Champion",
    subtitle: "Who wins the NFC East division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC East").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_nfc_north",
    category: "division",
    title: "NFC North Champion",
    subtitle: "Who wins the NFC North division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC North").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_nfc_south",
    category: "division",
    title: "NFC South Champion",
    subtitle: "Who wins the NFC South division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC South").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "div_nfc_west",
    category: "division",
    title: "NFC West Champion",
    subtitle: "Who wins the NFC West division title?",
    points: 10,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC West").map(t => ({ value: t.value, label: t.label }))
  },

  // 3. Team Win Totals Over/Under (5 Points Each)
  ...NFL_TEAMS_ALL.map(t => {
    const line = NFL_WIN_TOTALS[t.value] || 8.5;
    return {
      id: `ou_${t.value.toLowerCase()}`,
      category: "over_under" as const,
      title: `${t.label} - ${line} Wins`,
      subtitle: `Will the ${t.label.split(" ").pop()} win more (Over) or fewer (Under) than ${line} games?`,
      points: 5,
      options: [
        { value: "OVER", label: `OVER ${line} Wins` },
        { value: "UNDER", label: `UNDER ${line} Wins` }
      ]
    };
  }),
  // 4. Division Standings Finish Predictor (20 Points Each, 5 points per exact slot)
  {
    id: "standings_afc_east",
    category: "standings",
    title: "AFC East Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the AFC East.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC East").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_afc_north",
    category: "standings",
    title: "AFC North Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the AFC North.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC North").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_afc_south",
    category: "standings",
    title: "AFC South Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the AFC South.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC South").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_afc_west",
    category: "standings",
    title: "AFC West Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the AFC West.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "AFC West").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_nfc_east",
    category: "standings",
    title: "NFC East Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the NFC East.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC East").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_nfc_north",
    category: "standings",
    title: "NFC North Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the NFC North.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC North").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_nfc_south",
    category: "standings",
    title: "NFC South Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the NFC South.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC South").map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "standings_nfc_west",
    category: "standings",
    title: "NFC West Standings Order",
    subtitle: "Predict the exact 1st through 4th place finishing order of the NFC West.",
    points: 20,
    options: NFL_TEAMS_ALL.filter(t => t.division === "NFC West").map(t => ({ value: t.value, label: t.label }))
  }
];
