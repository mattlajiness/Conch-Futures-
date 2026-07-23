import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  '<p className="text-xs text-slate-400 mb-4 text-center">Drag and drop to reorder the teams from 1st to 4th place.</p>',
  '<p className="text-xs text-slate-400 mb-4 text-center">Drag and drop to reorder the teams from 1st to 4th place, and select Over or Under for each team\'s win total.</p>'
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
