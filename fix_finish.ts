import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const target = `<div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">`;
const replacement = `<div className="flex sm:items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed finish wrap");
