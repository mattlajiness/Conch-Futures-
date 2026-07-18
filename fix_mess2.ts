import fs from 'fs';

let content = fs.readFileSync('src/constants.ts', 'utf-8');

// I need to undo the weird trades
content = content.replace('{ value: "tua_tagovailoa", label: "Tua Tagovailoa (Falcons)" }', '{ value: "tua_tagovailoa", label: "Tua Tagovailoa (Dolphins)" }');
content = content.replace('{ value: "justin_jefferson", label: "Justin Jefferson (Browns)" }', '{ value: "justin_jefferson", label: "Justin Jefferson (Vikings)" }');
content = content.replace('{ value: "aj_brown", label: "A.J. Brown (Patriots)" }', '{ value: "aj_brown", label: "A.J. Brown (Eagles)" }');
content = content.replace('{ value: "micah_parsons", label: "Micah Parsons (Packers)" }', '{ value: "micah_parsons", label: "Micah Parsons (Cowboys)" }');
content = content.replace('{ value: "myles_garrett", label: "Myles Garrett (Rams)" }', '{ value: "myles_garrett", label: "Myles Garrett (Browns)" }');
content = content.replace('{ value: "sauce_gardner", label: "Sauce Gardner (Colts)" }', '{ value: "sauce_gardner", label: "Sauce Gardner (Jets)" }');

fs.writeFileSync('src/constants.ts', content);
