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
  ARI: 3.5,
  ATL: 6.5,
  BAL: 11.5,
  BUF: 10.5,
  CAR: 7.5,
  CHI: 9.5,
  CIN: 10.5,
  CLE: 5.5,
  DAL: 9.5,
  DEN: 9.5,
  DET: 10.5,
  GB: 9.5,
  HOU: 9.5,
  IND: 7.5,
  JAX: 8.5,
  KC: 10.5,
  LV: 6.5,
  LAC: 9.5,
  LAR: 11.5,
  MIA: 4.5,
  MIN: 8.5,
  NE: 9.5,
  NO: 7.5,
  NYG: 7.5,
  NYJ: 5.5,
  PHI: 9.5,
  PIT: 8.5,
  SF: 10.5,
  SEA: 10.5,
  TB: 8.5,
  TEN: 6.5,
  WAS: 7.5
};

export const FUTURES_QUESTIONS: FutureQuestion[] = [
  // 1. Championship & Awards (Huge Points)
  {
    id: "super_bowl",
    category: "championship",
    title: "Super Bowl LXI Winner",
    subtitle: "Who will raise the Lombardi Trophy at the end of the 2026-2027 season?",
    points: 25,
    options: NFL_TEAMS_ALL.map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "afc_champ",
    category: "championship",
    title: "AFC Champion",
    subtitle: "Which American Football Conference team wins the conference in 2026-2027?",
    points: 15,
    options: AFC_TEAMS.map(t => ({ value: t.value, label: t.label }))
  },
  {
    id: "nfc_champ",
    category: "championship",
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
      { value: "josh_allen", label: "Josh Allen" },
      { value: "lamar_jackson", label: "Lamar Jackson" },
      { value: "joe_burrow", label: "Joe Burrow" },
      { value: "justin_herbert", label: "Justin Herbert" },
      { value: "patrick_mahomes", label: "Patrick Mahomes" },
      { value: "drake_maye", label: "Drake Maye" },
      { value: "dak_prescott", label: "Dak Prescott" },
      { value: "caleb_williams", label: "Caleb Williams" },
      { value: "matthew_stafford", label: "Matthew Stafford" },
      { value: "jordan_love", label: "Jordan Love" },
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
      { value: "bijan_robinson", label: "Bijan Robinson" },
      { value: "jahmyr_gibbs", label: "Jahmyr Gibbs" },
      { value: "jamarr_chase", label: "Ja'Marr Chase" },
      { value: "puka_nacua", label: "Puka Nacua" },
      { value: "christian_mccaffrey", label: "Christian McCaffrey" },
      { value: "justin_jefferson", label: "Justin Jefferson" },
      { value: "jaxon_smith_njigba", label: "Jaxon Smith-Njigba" },
      { value: "saquon_barkley", label: "Saquon Barkley" },
      { value: "ceedee_lamb", label: "CeeDee Lamb" },
      { value: "james_cook", label: "James Cook" },
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
      { value: "myles_garrett", label: "Myles Garrett" },
      { value: "will_anderson", label: "Will Anderson" },
      { value: "aidan_hutchinson", label: "Aidan Hutchinson" },
      { value: "maxx_crosby", label: "Maxx Crosby" },
      { value: "nick_bosa", label: "Nick Bosa" },
      { value: "nik_bonitto", label: "Nik Bonitto" },
      { value: "brian_burns", label: "Brian Burns" },
      { value: "tj_watt", label: "T.J. Watt" },
      { value: "jared_verse", label: "Jared Verse" },
      { value: "trey_hendrickson", label: "Trey Hendrickson" },
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
      { value: "jeremiyah_love", label: "Jeremiyah Love" },
      { value: "fernando_mendoza", label: "Fernando Mendoza" },
      { value: "carnell_tate", label: "Carnell Tate" },
      { value: "jordyn_tyson", label: "Jordyn Tyson" },
      { value: "jadarian_price", label: "Jadarian Price" },
      { value: "makai_lemon", label: "Makai Lemon" },
      { value: "kenyon_sadiq", label: "Kenyon Sadiq" },
      { value: "antonio_williams", label: "Antonio Williams" },
      { value: "kc_concepcion", label: "KC Concepcion" },
      { value: "carson_beck", label: "Carson Beck" },
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
      { value: "rueben_bain", label: "Rueben Bain" },
      { value: "david_bailey", label: "David Bailey" },
      { value: "arvell_reese", label: "Arvell Reese" },
      { value: "sonny_styles", label: "Sonny Styles" },
      { value: "caleb_downs", label: "Caleb Downs" },
      { value: "mansoor_delane", label: "Mansoor Delane" },
      { value: "akheem_mesidor", label: "Akheem Mesidor" },
      { value: "jacob_rodriguez", label: "Jacob Rodriguez" },
      { value: "malachi_lawrence", label: "Malachi Lawrence" },
      { value: "cj_allen", label: "CJ Allen" },
      { value: "other", label: "Other / Field" }
    ]
  },
  {
    id: "cpoy",
    category: "award",
    title: "Comeback Player of the Year (CPOY)",
    subtitle: "AP Comeback Player of the Year.",
    points: 10,
    options: [
      { value: "patrick_mahomes", label: "Patrick Mahomes" },
      { value: "jayden_daniels", label: "Jayden Daniels" },
      { value: "kyler_murray", label: "Kyler Murray" },
      { value: "micah_parsons", label: "Micah Parsons" },
      { value: "malik_nabers", label: "Malik Nabers" },
      { value: "george_kittle", label: "George Kittle" },
      { value: "daniel_jones", label: "Daniel Jones" },
      { value: "nick_bosa", label: "Nick Bosa" },
      { value: "fred_warner", label: "Fred Warner" },
      { value: "travis_hunter", label: "Travis Hunter" },
      { value: "other", label: "Other / Field" }
    ]
  },
  {
    id: "coty",
    category: "award",
    title: "Coach of the Year (COTY)",
    subtitle: "AP Coach of the Year for 2026-2027.",
    points: 10,
    options: [
      { value: "jim_harbaugh", label: "Jim Harbaugh" },
      { value: "dan_campbell", label: "Dan Campbell" },
      { value: "demeco_ryans", label: "DeMeco Ryans" },
      { value: "shane_steichen", label: "Shane Steichen" },
      { value: "matt_eberflus", label: "Matt Eberflus" },
      { value: "matt_lafleur", label: "Matt LaFleur" },
      { value: "kevin_stefanski", label: "Kevin Stefanski" },
      { value: "john_harbaugh", label: "John Harbaugh" },
      { value: "dan_quinn", label: "Dan Quinn" },
      { value: "zac_taylor", label: "Zac Taylor" },
      { value: "other", label: "Other / Field" }
    ]
  },

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
  ];
