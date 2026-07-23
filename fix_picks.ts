import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(/gap-6/g, 'gap-4');
content = content.replace(/mb-6 mt-10/g, 'mb-4 mt-6');
content = content.replace(/mb-6/g, 'mb-4');
content = content.replace(/p-5/g, 'p-4');
content = content.replace(/pb-3/g, 'pb-2');
content = content.replace(/pt-4 mt-2/g, 'pt-3 mt-1');
content = content.replace(/space-y-4/g, 'space-y-3');

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed PicksTab");
