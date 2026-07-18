import fs from 'fs';

let content = fs.readFileSync('src/constants.ts', 'utf-8');

// Replace the OROY 2026 Class
const oroyStart = content.indexOf('title: "Offensive Rookie of the Year (OROY)",');
const oroyEnd = content.indexOf(']', oroyStart);
const oroyString = content.substring(oroyStart, oroyEnd + 1);

const newOroy = `title: "Offensive Rookie of the Year (OROY)",
    subtitle: "AP Offensive Rookie of the Year candidates.",
    points: 10,
    options: [
      { value: "miller_moss", label: "Miller Moss (Bears)" },
      { value: "taylen_green", label: "Taylen Green (Browns)" },
      { value: "luke_altmyer", label: "Luke Altmyer (Lions)" },
      { value: "zachariah_branch", label: "Zachariah Branch (Falcons)" },
      { value: "juice_wells_jr", label: "Juice Wells Jr. (Falcons)" },
      { value: "kyron_drones", label: "Kyron Drones (Packers)" },
      { value: "garrett_nussmeier", label: "Garrett Nussmeier (Chiefs)" },
      { value: "cade_klubnik", label: "Cade Klubnik (Jets)" },
      { value: "nicholas_singleton", label: "Nicholas Singleton (Titans)" },
      { value: "tj_harden", label: "T.J. Harden (Browns)" },
      { value: "other", label: "Other / Field" }
    ]`;

content = content.replace(oroyString, newOroy);

// Replace DROY 2026 Class
const droyStart = content.indexOf('title: "Defensive Rookie of the Year (DROY)",');
const droyEnd = content.indexOf(']', droyStart);
const droyString = content.substring(droyStart, droyEnd + 1);

const newDroy = `title: "Defensive Rookie of the Year (DROY)",
    subtitle: "AP Defensive Rookie of the Year candidates.",
    points: 10,
    options: [
      { value: "harold_perkins_jr", label: "Harold Perkins Jr. (Falcons)" },
      { value: "davison_igbinosun", label: "Davison Igbinosun (Bills)" },
      { value: "tj_parker", label: "TJ Parker (Bills)" },
      { value: "malik_muhammad", label: "Malik Muhammad (Bears)" },
      { value: "cashius_howell", label: "Cashius Howell (Bengals)" },
      { value: "kendal_daniels", label: "Kendal Daniels (Falcons)" },
      { value: "zane_durant", label: "Zane Durant (Bills)" },
      { value: "toriano_pride_jr", label: "Toriano Pride Jr. (Bills)" },
      { value: "eric_gentry", label: "Eric Gentry (Bengals)" },
      { value: "other", label: "Other / Field" }
    ]`;

content = content.replace(droyString, newDroy);

fs.writeFileSync('src/constants.ts', content);
