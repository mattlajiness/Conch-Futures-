import * as fs from 'fs';

function replaceSpaceY(file: string) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/space-y-4/g, 'space-y-2');
  content = content.replace(/space-y-6/g, 'space-y-3');
  content = content.replace(/space-y-8/g, 'space-y-4');
  fs.writeFileSync(file, content);
}

replaceSpaceY('src/components/PicksTab.tsx');
replaceSpaceY('src/components/StandingsTab.tsx');
replaceSpaceY('src/components/ComparePicksTab.tsx');
replaceSpaceY('src/components/AdminTab.tsx');
replaceSpaceY('src/components/PoolDetail.tsx');
console.log("Compressed space-y classes");
