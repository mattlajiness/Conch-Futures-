import * as fs from 'fs';

let content = fs.readFileSync('src/components/PoolDetail.tsx', 'utf-8');

// Only show category filter if activeTab !== "picks"
content = content.replace(
  '{/* Category Filter Selector */}',
  '{activeTab !== "picks" && (\n      {/* Category Filter Selector */}'
);

content = content.replace(
  '          ].map((cat) => (\n            <button\n              key={cat.id}\n              onClick={() => setCategoryFilter(cat.id)}\n              className={`px-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer ${\n                categoryFilter === cat.id\n                  ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"\n                  : "bg-slate-800/50 hover:bg-slate-800 border-transparent text-slate-400 hover:text-slate-200"\n              }`}\n            >\n              {cat.label}\n            </button>\n          ))}\n        </div>\n      </div>',
  '          ].map((cat) => (\n            <button\n              key={cat.id}\n              onClick={() => setCategoryFilter(cat.id)}\n              className={`px-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer ${\n                categoryFilter === cat.id\n                  ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"\n                  : "bg-slate-800/50 hover:bg-slate-800 border-transparent text-slate-400 hover:text-slate-200"\n              }`}\n            >\n              {cat.label}\n            </button>\n          ))}\n        </div>\n      </div>\n      )}'
);
fs.writeFileSync('src/components/PoolDetail.tsx', content);
