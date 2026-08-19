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

export const getNflTeamLogoUrl = (teamCode: string) =>
  `https://a.espncdn.com/i/teamlogos/nfl/500/${teamCode.toLowerCase()}.png`;

export const createEmojiAvatarUrl = (emoji: string, bg = "%230f172a", border = "%23334155", y = "54%") =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="${bg}" stroke="${border}" stroke-width="4"/><text x="50%" y="${y}" font-size="64" dominant-baseline="central" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text></svg>`;

export const FOOTBALL_ICONS_AND_AVATARS = [
  {
    id: "fb_ball",
    label: "Gridiron Football",
    category: "Football",
    icon: "🏈",
    url: createEmojiAvatarUrl("🏈", "%231e293b", "%23059669"),
  },
  {
    id: "fb_trophy",
    label: "Lombardi Trophy",
    category: "Football",
    icon: "🏆",
    url: createEmojiAvatarUrl("🏆", "%231e293b", "%23f59e0b"),
  },
  {
    id: "fb_helmet",
    label: "Football Helmet",
    category: "Football",
    icon: "🪖",
    url: createEmojiAvatarUrl("🪖", "%231e293b", "%233b82f6"),
  },
  {
    id: "fb_stadium",
    label: "NFL Stadium",
    category: "Football",
    icon: "🏟️",
    url: createEmojiAvatarUrl("🏟️", "%231e293b", "%2310b981"),
  },
  {
    id: "fb_ring",
    label: "Super Bowl Ring",
    category: "Football",
    icon: "💍",
    url: createEmojiAvatarUrl("💍", "%231e293b", "%23eab308"),
  },
  {
    id: "fb_gold_medal",
    label: "Gold Medal (#1)",
    category: "Football",
    icon: "🥇",
    url: createEmojiAvatarUrl("🥇", "%231e293b", "%23eab308"),
  },
  {
    id: "fb_target",
    label: "Accurate Passer",
    category: "Football",
    icon: "🎯",
    url: createEmojiAvatarUrl("🎯", "%231e293b", "%23ef4444"),
  },
  {
    id: "fb_playbook",
    label: "Coach Playbook",
    category: "Football",
    icon: "📋",
    url: createEmojiAvatarUrl("📋", "%231e293b", "%2306b6d4"),
  },
  {
    id: "fb_megaphone",
    label: "Sideline Megaphone",
    category: "Football",
    icon: "📢",
    url: createEmojiAvatarUrl("📢", "%231e293b", "%238b5cf6"),
  },
  {
    id: "fb_stopwatch",
    label: "2-Minute Warning",
    category: "Football",
    icon: "⏱️",
    url: createEmojiAvatarUrl("⏱️", "%231e293b", "%23f97316"),
  },
  {
    id: "fb_jersey",
    label: "Game Jersey",
    category: "Football",
    icon: "🎽",
    url: createEmojiAvatarUrl("🎽", "%231e293b", "%2314b8a6"),
  },
  {
    id: "fb_cleats",
    label: "Turf Cleats",
    category: "Football",
    icon: "👟",
    url: createEmojiAvatarUrl("👟", "%231e293b", "%2364748b"),
  },
  {
    id: "nfl_shield",
    label: "NFL Shield",
    category: "Football",
    icon: "🛡️",
    url: "https://upload.wikimedia.org/wikipedia/en/a/a2/National_Football_League_logo.svg",
  },
  {
    id: "afc_logo",
    label: "AFC Conference",
    category: "Football",
    icon: "🔴",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/American_Football_Conference_logo.svg",
  },
  {
    id: "nfc_logo",
    label: "NFC Conference",
    category: "Football",
    icon: "🔵",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/National_Football_Conference_logo.svg",
  },
];

export const POPULAR_EMOJIS_AND_AVATARS = [
  {
    id: "emoji_goat",
    label: "The G.O.A.T.",
    category: "Hype & Animals",
    icon: "🐐",
    url: createEmojiAvatarUrl("🐐", "%231e293b", "%23eab308"),
  },
  {
    id: "emoji_fire",
    label: "On Fire Streak",
    category: "Hype & Animals",
    icon: "🔥",
    url: createEmojiAvatarUrl("🔥", "%231e293b", "%23f97316"),
  },
  {
    id: "emoji_crown",
    label: "The King / Crown",
    category: "Hype & Animals",
    icon: "👑",
    url: createEmojiAvatarUrl("👑", "%231e293b", "%23eab308"),
  },
  {
    id: "emoji_lightning",
    label: "Lightning Bolt",
    category: "Hype & Animals",
    icon: "⚡",
    url: createEmojiAvatarUrl("⚡", "%231e293b", "%2338bdf8"),
  },
  {
    id: "emoji_muscle",
    label: "Power Flex",
    category: "Hype & Animals",
    icon: "💪",
    url: createEmojiAvatarUrl("💪", "%231e293b", "%2310b981"),
  },
  {
    id: "emoji_money",
    label: "Cash In / Bag",
    category: "Hype & Animals",
    icon: "💰",
    url: createEmojiAvatarUrl("💰", "%231e293b", "%2322c55e"),
  },
  {
    id: "emoji_rocket",
    label: "Rocket Launch",
    category: "Hype & Animals",
    icon: "🚀",
    url: createEmojiAvatarUrl("🚀", "%231e293b", "%23a855f7"),
  },
  {
    id: "emoji_100",
    label: "100 Percent",
    category: "Hype & Animals",
    icon: "💯",
    url: createEmojiAvatarUrl("💯", "%231e293b", "%23ef4444"),
  },
  {
    id: "emoji_lion",
    label: "Lion Pride",
    category: "Hype & Animals",
    icon: "🦁",
    url: createEmojiAvatarUrl("🦁", "%231e293b", "%230ea5e9"),
  },
  {
    id: "emoji_eagle",
    label: "Soaring Eagle",
    category: "Hype & Animals",
    icon: "🦅",
    url: createEmojiAvatarUrl("🦅", "%231e293b", "%23059669"),
  },
  {
    id: "emoji_bear",
    label: "Bear Claws",
    category: "Hype & Animals",
    icon: "🐻",
    url: createEmojiAvatarUrl("🐻", "%231e293b", "%23f97316"),
  },
  {
    id: "emoji_bull",
    label: "Raging Bull",
    category: "Hype & Animals",
    icon: "🐂",
    url: createEmojiAvatarUrl("🐂", "%231e293b", "%23dc2626"),
  },
  {
    id: "emoji_tiger",
    label: "Bengal Tiger",
    category: "Hype & Animals",
    icon: "🐯",
    url: createEmojiAvatarUrl("🐯", "%231e293b", "%23ea580c"),
  },
  {
    id: "emoji_wolf",
    label: "Alpha Wolf",
    category: "Hype & Animals",
    icon: "🐺",
    url: createEmojiAvatarUrl("🐺", "%231e293b", "%2394a3b8"),
  },
  {
    id: "emoji_dolphin",
    label: "Speed Dolphin",
    category: "Hype & Animals",
    icon: "🐬",
    url: createEmojiAvatarUrl("🐬", "%231e293b", "%2306b6d4"),
  },
  {
    id: "emoji_horse",
    label: "Wild Bronco",
    category: "Hype & Animals",
    icon: "🐎",
    url: createEmojiAvatarUrl("🐎", "%231e293b", "%23f97316"),
  },
  {
    id: "emoji_skull",
    label: "Iron Defense Skull",
    category: "Hype & Animals",
    icon: "💀",
    url: createEmojiAvatarUrl("💀", "%231e293b", "%2364748b"),
  },
  {
    id: "emoji_diamond",
    label: "Diamond Hands",
    category: "Hype & Animals",
    icon: "💎",
    url: createEmojiAvatarUrl("💎", "%231e293b", "%2338bdf8"),
  },
  {
    id: "emoji_cold",
    label: "Ice In Veins",
    category: "Hype & Animals",
    icon: "🥶",
    url: createEmojiAvatarUrl("🥶", "%231e293b", "%230284c7"),
  },
  {
    id: "emoji_pepper",
    label: "Red Hot",
    category: "Hype & Animals",
    icon: "🌶️",
    url: createEmojiAvatarUrl("🌶️", "%231e293b", "%23e11d48"),
  },
  {
    id: "emoji_brain",
    label: "Mastermind GM",
    category: "Hype & Animals",
    icon: "🧠",
    url: createEmojiAvatarUrl("🧠", "%231e293b", "%23ec4899"),
  },
  {
    id: "emoji_dice",
    label: "High Roller Dice",
    category: "Hype & Animals",
    icon: "🎲",
    url: createEmojiAvatarUrl("🎲", "%231e293b", "%236366f1"),
  },
  {
    id: "emoji_star",
    label: "Superstar",
    category: "Hype & Animals",
    icon: "⭐",
    url: createEmojiAvatarUrl("⭐", "%231e293b", "%23eab308"),
  },
  {
    id: "emoji_bomb",
    label: "Deep Bomb",
    category: "Hype & Animals",
    icon: "💣",
    url: createEmojiAvatarUrl("💣", "%231e293b", "%23475569"),
  },
  {
    id: "emoji_shades",
    label: "Cool Stance",
    category: "Hype & Animals",
    icon: "😎",
    url: createEmojiAvatarUrl("😎", "%231e293b", "%23f59e0b"),
  },
  {
    id: "emoji_lock",
    label: "Lock It In",
    category: "Hype & Animals",
    icon: "🔒",
    url: createEmojiAvatarUrl("🔒", "%231e293b", "%23eab308"),
  },
];

export const SPECIAL_AVATAR_LOGOS = [
  ...FOOTBALL_ICONS_AND_AVATARS,
  ...POPULAR_EMOJIS_AND_AVATARS,
];

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

export const BEER_AND_LEISURE_AVATARS = [
  {
    id: "leisure_cig",
    label: "Cigarette",
    category: "Leisure",
    icon: "🚬",
    url: createEmojiAvatarUrl("🚬", "%231e293b", "%2394a3b8", "50%"),
  },
  {
    id: "beer_budweiser",
    label: "Budweiser",
    category: "Leisure",
    icon: "🍻",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Budweiser_Anheuser-Busch_logo.svg",
  },
  {
    id: "beer_budlight",
    label: "Bud Light",
    category: "Leisure",
    icon: "🍺",
    url: "https://cdn.worldvectorlogo.com/logos/bud-light.svg",
  },
  {
    id: "beer_miller",
    label: "Miller Lite",
    category: "Leisure",
    icon: "🍺",
    url: "https://upload.wikimedia.org/wikipedia/en/f/f3/MillerLite2014.png",
  },
  {
    id: "beer_coors",
    label: "Coors Light",
    category: "Leisure",
    icon: "🏔️",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/63/Coors_Light_logo.svg",
  },
  {
    id: "beer_modelo",
    label: "Modelo Especial",
    category: "Leisure",
    icon: "🍺",
    url: "https://cdn.worldvectorlogo.com/logos/modelo-especial.svg",
  },
  {
    id: "beer_corona",
    label: "Corona Extra",
    category: "Leisure",
    icon: "🍋",
    url: "https://upload.wikimedia.org/wikipedia/en/7/71/Corona_Extra.svg",
  },
  {
    id: "beer_heineken",
    label: "Heineken",
    category: "Leisure",
    icon: "🍺",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Heineken_logo.svg",
  },
  {
    id: "beer_stella",
    label: "Stella Artois",
    category: "Leisure",
    icon: "🍺",
    url: "https://upload.wikimedia.org/wikipedia/en/3/37/Stella_Artois_logo.svg",
  },
  {
    id: "beer_pabst",
    label: "Pabst Blue Ribbon",
    category: "Leisure",
    icon: "🍺",
    url: "https://upload.wikimedia.org/wikipedia/en/c/cd/Pabst_Blue_Ribbon_logo.svg",
  },
  {
    id: "beer_guinness",
    label: "Guinness",
    category: "Leisure",
    icon: "🍺",
    url: "https://upload.wikimedia.org/wikipedia/en/f/f8/Guinness_logo_dark_text.svg",
  },
  {
    id: "leisure_whiskey",
    label: "Whiskey",
    category: "Leisure",
    icon: "🥃",
    url: createEmojiAvatarUrl("🥃", "%231e293b", "%23d97706"),
  }
];

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
