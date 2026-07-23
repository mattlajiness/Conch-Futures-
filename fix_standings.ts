import * as fs from 'fs';

let content = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');

content = content.replace(/gap-8/g, 'gap-4');
content = content.replace(/gap-4/g, 'gap-3');
content = content.replace(/p-4/g, 'p-3');
content = content.replace(/p-3/g, 'p-2.5');
content = content.replace(/gap-3\.5/g, 'gap-2.5');

fs.writeFileSync('src/components/StandingsTab.tsx', content);
console.log("Fixed StandingsTab");
