import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(
  '<span className="text-[11px] sm:text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span>',
  '<span className="text-[11px] sm:text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap font-bold">{NFL_WIN_TOTALS[teamVal] || 8.5}</span>'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
