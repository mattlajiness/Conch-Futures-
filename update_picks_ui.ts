import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const target = `{/* Sticky footer Save helper */}`;
const replacement = `      {/* Tiebreaker Section */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 shadow-sm space-y-3 mb-4">
        <h2 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-2">
          Tiebreaker
        </h2>
        <p className="text-xs text-slate-400">
          In the event of a tie, what will be the total combined points scored in the Super Bowl? (Closest without going over wins the tiebreaker).
        </p>
        <div className="mt-2">
          <input
            type="number"
            min="0"
            value={tiebreaker}
            onChange={(e) => setTiebreaker(e.target.value)}
            placeholder="e.g. 52"
            className="w-full sm:w-32 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Sticky footer Save helper */}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/PicksTab.tsx', content);
