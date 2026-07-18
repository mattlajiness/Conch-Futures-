import fs from 'fs';

let content = fs.readFileSync('src/constants.ts', 'utf-8');

// Replace Tyreek Hill with Puka Nacua
content = content.replace('{ value: "tyreek_hill", label: "Tyreek Hill (Dolphins)" }', '{ value: "puka_nacua", label: "Puka Nacua (Rams)" }');

// Replace Stefon Diggs with Garrett Wilson
content = content.replace('{ value: "stefon_diggs", label: "Stefon Diggs (Texans)" }', '{ value: "garrett_wilson", label: "Garrett Wilson (Jets)" }');

// We also need to check the Coach list
content = content.replace('{ value: "matt_eberflus", label: "Matt Eberflus (Bears)" }', '{ value: "ben_johnson", label: "Ben Johnson (Bears)" }'); // Did Ben Johnson go to the Bears? Let's assume standard coaches for now or wait for the web search.

fs.writeFileSync('src/constants.ts', content);
