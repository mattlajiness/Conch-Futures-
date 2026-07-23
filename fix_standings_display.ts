import * as fs from 'fs';
let content = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');

const target = `<div className="text-right flex-shrink-0">
                        <span className="text-slate-400 text-[10px] sm:text-[11px] block">TOTAL POINTS</span>
                        <span className="text-lg font-mono font-extrabold text-emerald-400">
                          {row.score} <span className="text-[10px] font-semibold text-slate-500 uppercase">PTS</span>
                        </span>
                      </div>`;
const rep = `<div className="text-right flex-shrink-0">
                        <span className="text-slate-400 text-[10px] sm:text-[11px] block">TOTAL POINTS</span>
                        <span className="text-lg font-mono font-extrabold text-emerald-400">
                          {row.score} <span className="text-[10px] font-semibold text-slate-500 uppercase">PTS</span>
                        </span>
                        {row.tiebreaker && (
                          <div className="text-[9px] text-slate-500 font-mono mt-1">
                            TB: {row.tiebreaker} {row.tiebreakerDiff !== undefined ? \`(\${row.tiebreakerDiff} off)\` : ''}
                          </div>
                        )}
                      </div>`;

content = content.replace(target, rep);
fs.writeFileSync('src/components/StandingsTab.tsx', content);
