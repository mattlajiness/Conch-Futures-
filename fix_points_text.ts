import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(
  '<div className="mt-2 inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold">\n                        +{getPoints(q.id, q.points)} PTS (Exact Match)\n                      </div>',
  '<div className="mt-2 inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold">\n                        +{getPoints(q.id, q.points) / 4} PTS per spot (+10 PTS Bonus for exact 1-4 order)\n                      </div>'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
