import * as fs from 'fs';

let content = fs.readFileSync('src/components/PoolDetail.tsx', 'utf-8');

content = content.replace('className="max-w-7xl mx-auto py-6 px-4 sm:px-6"', 'className="max-w-7xl mx-auto py-4 px-2 sm:px-4"');
content = content.replace('className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-lg mb-8"', 'className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow-lg mb-4"');
content = content.replace('className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 shadow-inner"', 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl mb-4 shadow-inner"');
content = content.replace('className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-6 min-h-[50vh] shadow-inner"', 'className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 sm:p-4 min-h-[50vh] shadow-inner"');

fs.writeFileSync('src/components/PoolDetail.tsx', content);
console.log("Fixed PoolDetail");
