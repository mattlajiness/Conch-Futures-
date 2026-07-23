import * as fs from 'fs';
function fixH(file: string) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/mb-6 mt-10/g, 'mb-2 mt-4');
  content = content.replace(/mb-4 mt-6/g, 'mb-2 mt-3');
  content = content.replace(/mb-4 mt-4/g, 'mb-2 mt-2');
  content = content.replace(/mb-6/g, 'mb-2');
  content = content.replace(/mb-4/g, 'mb-2');
  content = content.replace(/pb-3/g, 'pb-1');
  content = content.replace(/pb-2/g, 'pb-1');
  fs.writeFileSync(file, content);
}
fixH('src/components/PicksTab.tsx');
fixH('src/components/StandingsTab.tsx');
fixH('src/components/ComparePicksTab.tsx');
fixH('src/components/AdminTab.tsx');
console.log("Fixed headings spacing");
