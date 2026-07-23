import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  "{ id: 'ou', label: 'Win Totals', category: 'over_under' },",
  "// { id: 'ou', label: 'Win Totals', category: 'over_under' },"
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
