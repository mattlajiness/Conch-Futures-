import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const oldOuLayout = `<div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-1">
                            <div className="text-xs text-slate-300 font-medium ml-[140px] hidden sm:block">
                              Win Total: <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                            </div>
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full hidden sm:block">
                              +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                            </span>
                            <div className="text-xs text-slate-300 font-medium sm:hidden">
                              Wins: <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                            </div>
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full sm:hidden">
                              +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                            </span>
                            <div className="flex gap-2">`;

const newOuLayout = `<div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-700/50 pt-2 mt-2 gap-2 sm:gap-0">
                            <div className="flex items-center justify-between sm:justify-start gap-2 sm:ml-[140px]">
                              <div className="text-xs text-slate-300 font-medium">
                                <span className="hidden sm:inline">Win Total: </span>
                                <span className="sm:hidden">Wins: </span>
                                <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                              </div>
                              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                              </span>
                            </div>
                            <div className="flex gap-2 justify-end">`;

content = content.replace(oldOuLayout, newOuLayout);

// Also need to check if we missed any standard questions that might wrap badly
content = content.replace(/<span className="text-\[10px\] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500\/15 border border-emerald-500\/20 px-2 py-0\.5 rounded-full">/g, 
  '<span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">');

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed mobile layout in PicksTab");
