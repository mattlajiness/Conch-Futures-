import * as fs from 'fs';

let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

content = content.replace(/space-y-6/g, 'space-y-4');
content = content.replace(/space-y-8/g, 'space-y-5');
content = content.replace(/p-5/g, 'p-4');
content = content.replace(/gap-6/g, 'gap-4');
content = content.replace(/p-4/g, 'p-3');

fs.writeFileSync('src/components/AdminTab.tsx', content);
console.log("Fixed AdminTab");
