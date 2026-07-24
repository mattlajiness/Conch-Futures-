import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const oldBlock = `                                <>
                                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                    <img src={\`https://a.espncdn.com/i/teamlogos/nfl/500/\${teamVal.toLowerCase()}.png\`} alt={teamLabel} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-1 flex flex-row justify-between items-center pr-1 sm:pr-2 gap-1 sm:gap-2">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>
                                    <div className="flex items-center justify-end gap-1 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                                      <span className="text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span>
                                      <div className="flex gap-1">
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(\`ou_\${teamVal.toLowerCase()}\`, 'over'); }}
                                          className={\`px-2 py-0.5 rounded text-[10px] font-bold transition-colors \${selections[\`ou_\${teamVal.toLowerCase()}\`] === 'over' ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
                                        >O</button>
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(\`ou_\${teamVal.toLowerCase()}\`, 'under'); }}
                                          className={\`px-2 py-0.5 rounded text-[10px] font-bold transition-colors \${selections[\`ou_\${teamVal.toLowerCase()}\`] === 'under' ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
                                        >U</button>
                                      </div>
                                    </div>
                                  </div>
                                  <GripVertical className="w-5 h-5 text-slate-600 shrink-0" />
                                </>`;

const newBlock = `                                <>
                                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                    <img src={\`https://a.espncdn.com/i/teamlogos/nfl/500/\${teamVal.toLowerCase()}.png\`} alt={teamLabel} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-1 flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center pr-1 sm:pr-2 gap-2 sm:gap-2 overflow-hidden">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1 w-full sm:w-auto">{teamLabel}</span>
                                    <div className="flex items-center justify-start sm:justify-end gap-1 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0 w-full sm:w-auto" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                                      <span className="text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap flex-grow sm:flex-grow-0 text-center">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span>
                                      <div className="flex gap-1 shrink-0">
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(\`ou_\${teamVal.toLowerCase()}\`, 'over'); }}
                                          className={\`px-3 sm:px-2 py-1 sm:py-0.5 rounded text-[10px] sm:text-[10px] font-bold transition-colors \${selections[\`ou_\${teamVal.toLowerCase()}\`] === 'over' ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
                                        >O</button>
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(\`ou_\${teamVal.toLowerCase()}\`, 'under'); }}
                                          className={\`px-3 sm:px-2 py-1 sm:py-0.5 rounded text-[10px] sm:text-[10px] font-bold transition-colors \${selections[\`ou_\${teamVal.toLowerCase()}\`] === 'under' ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
                                        >U</button>
                                      </div>
                                    </div>
                                  </div>
                                  <GripVertical className="w-5 h-5 text-slate-600 shrink-0 hidden sm:block" />
                                  <div className="flex flex-col gap-0 sm:hidden shrink-0 border-l border-slate-700 pl-1">
                                     <button type="button" onClick={(e) => { e.stopPropagation(); handleMove(q.id, index, 'up'); }} disabled={index === 0} className="p-1 text-slate-400 disabled:opacity-20 active:bg-slate-800 rounded"><ChevronUp className="w-5 h-5" /></button>
                                     <button type="button" onClick={(e) => { e.stopPropagation(); handleMove(q.id, index, 'down'); }} disabled={index === 3} className="p-1 text-slate-400 disabled:opacity-20 active:bg-slate-800 rounded"><ChevronDown className="w-5 h-5" /></button>
                                  </div>
                                </>`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/PicksTab.tsx', content);
