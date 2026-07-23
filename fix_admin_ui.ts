import * as fs from 'fs';
let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

const target = `{activeQuestionsList.length === 0 && (`;
const rep = `{/* Tiebreaker Grading Section */}
          <div className="space-y-2 pt-4 border-t border-slate-700/50 mt-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              Tiebreaker (Super Bowl Total Points)
            </h3>
            <div className="bg-slate-800/60 border border-slate-700/50 hover:border-slate-700 rounded-xl p-3 shadow-sm">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <div className="text-xs text-slate-300 font-medium">
                   Official Final Points
                 </div>
                 <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={tiebreakerResult}
                      onChange={(e) => setTiebreakerResult(e.target.value)}
                      placeholder="e.g. 52"
                      className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setTiebreakerResult("")}
                      className={\`px-2 py-1.5 ml-1 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer \${
                        tiebreakerResult ? "text-rose-400 hover:bg-rose-500/20" : "text-slate-600 cursor-default opacity-50"
                      }\`}
                    >
                      CLR
                    </button>
                 </div>
               </div>
            </div>
          </div>

          {activeQuestionsList.length === 0 && (`;

content = content.replace(target, rep);
fs.writeFileSync('src/components/AdminTab.tsx', content);
