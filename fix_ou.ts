import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const oldBlock = `<div className="flex-1 flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center pr-1 sm:pr-2 gap-2 sm:gap-2 min-w-0">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1 w-full sm:w-auto">{teamLabel}</span>
                                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0 w-full sm:w-auto" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                                      <span className="text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap flex-grow sm:flex-grow-0 text-center">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span>
                                      <div className="flex gap-1 shrink-0">`;

const newBlock = `<div className="flex-1 flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center pr-1 sm:pr-2 gap-1 sm:gap-2 min-w-0">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>
                                    <div className="flex items-center justify-start sm:justify-end gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0 mt-1 sm:mt-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                                      <span className="text-[11px] sm:text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span>
                                      <div className="flex gap-1 shrink-0">`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/PicksTab.tsx', content);
