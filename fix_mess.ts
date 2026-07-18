import fs from 'fs';

let content = fs.readFileSync('src/constants.ts', 'utf-8');

// I need to REDO the weird trades because they are ACCURATE for 2026!
content = content.replace('{ value: "tua_tagovailoa", label: "Tua Tagovailoa (Dolphins)" }', '{ value: "tua_tagovailoa", label: "Tua Tagovailoa (Falcons)" }');
content = content.replace('{ value: "justin_jefferson", label: "Justin Jefferson (Vikings)" }', '{ value: "justin_jefferson", label: "Justin Jefferson (Browns)" }');
content = content.replace('{ value: "aj_brown", label: "A.J. Brown (Eagles)" }', '{ value: "aj_brown", label: "A.J. Brown (Patriots)" }');
content = content.replace('{ value: "micah_parsons", label: "Micah Parsons (Cowboys)" }', '{ value: "micah_parsons", label: "Micah Parsons (Packers)" }');
content = content.replace('{ value: "myles_garrett", label: "Myles Garrett (Browns)" }', '{ value: "myles_garrett", label: "Myles Garrett (Rams)" }');
content = content.replace('{ value: "sauce_gardner", label: "Sauce Gardner (Jets)" }', '{ value: "sauce_gardner", label: "Sauce Gardner (Colts)" }');

fs.writeFileSync('src/constants.ts', content);
