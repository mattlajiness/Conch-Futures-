import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  '<!-- <div className="md:hidden w-full h-px bg-slate-700 my-4 relative">',
  '{/* <div className="md:hidden w-full h-px bg-slate-700 my-4 relative">'
);
content = content.replace(
  '<span className="bg-slate-900 px-3 text-slate-500 text-xs font-bold uppercase tracking-widest">VS</span></div> -->',
  '<span className="bg-slate-900 px-3 text-slate-500 text-xs font-bold uppercase tracking-widest">VS</span></div> */}'
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
