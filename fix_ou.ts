import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(
  '<div className="flex-1 flex justify-between items-center pr-2"><span className="font-bold text-slate-200">{teamLabel}</span><span className="text-[10px] text-slate-400 font-mono">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span></div>',
  `<div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center pr-2 gap-1 sm:gap-2">
                                    <span className="font-bold text-slate-200">{teamLabel}</span>
                                    <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 w-full sm:w-auto" onPointerDown={(e) => e.stopPropagation()}>
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
                                  </div>`
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
