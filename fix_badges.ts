import * as fs from 'fs';

let compare = fs.readFileSync('src/components/ComparePicksTab.tsx', 'utf-8');
compare = compare.replace(/<span className="text-\[10px\] font-mono uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500\/10 border border-emerald-500\/20 px-2 py-0\.5 rounded">/g, 
  '<span className="text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">');
fs.writeFileSync('src/components/ComparePicksTab.tsx', compare);

let standings = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');
// Let's find the points badge in standings
standings = standings.replace(/<span className="text-\[9px\] font-mono font-bold text-slate-500">/g, 
  '<span className="text-[9px] font-mono font-bold text-slate-500 shrink-0">');
fs.writeFileSync('src/components/StandingsTab.tsx', standings);

console.log("Fixed badges.");
