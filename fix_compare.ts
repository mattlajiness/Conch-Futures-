import * as fs from 'fs';

let content = fs.readFileSync('src/components/ComparePicksTab.tsx', 'utf-8');

content = content.replace(/gap-8/g, 'gap-4');
content = content.replace(/space-y-6/g, 'space-y-4');
content = content.replace(/p-6/g, 'p-4');
content = content.replace(/p-8/g, 'p-5');
content = content.replace(/gap-4/g, 'gap-3');
content = content.replace(/p-4/g, 'p-3');

fs.writeFileSync('src/components/ComparePicksTab.tsx', content);
console.log("Fixed ComparePicksTab");
