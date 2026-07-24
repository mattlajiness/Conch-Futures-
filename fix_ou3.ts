import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const oldBlock = `<div className="flex-1 flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center pr-1 sm:pr-2 gap-1 sm:gap-2 min-w-0">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>
                                    <div className="flex items-center justify-start sm:justify-end gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0 mt-1 sm:mt-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>`;

const newBlock = `<div className="flex-1 flex flex-row justify-between items-center pr-1 sm:pr-2 gap-2 min-w-0">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>
                                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/PicksTab.tsx', content);
