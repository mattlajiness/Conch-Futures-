import * as fs from 'fs';

let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

// Add customPoints state
content = content.replace('const [activeQuestions, setActiveQuestions] = useState<string[]>([]);', 'const [activeQuestions, setActiveQuestions] = useState<string[]>([]);\n  const [customPoints, setCustomPoints] = useState<Record<string, number>>({});');

// Initialize customPoints
content = content.replace('if (pool.activeQuestions) {', 'if (pool.customPoints) {\n      setCustomPoints(pool.customPoints);\n    }\n    if (pool.activeQuestions) {');

// Add customPoints to save function
content = content.replace('activeQuestions,', 'activeQuestions,\n        customPoints,');

// Handle points change function
const handlePointsChangeFn = `  const handlePointsChange = (qId: string, points: number) => {
    setCustomPoints(prev => ({
      ...prev,
      [qId]: points
    }));
  };

  const getPoints = (q: { id: string, points: number }) => {
    return customPoints[q.id] !== undefined ? customPoints[q.id] : q.points;
  };`;

content = content.replace('const handleToggleQuestion = (qId: string) => {', handlePointsChangeFn + '\n\n  const handleToggleQuestion = (qId: string) => {');

// Render the input in each question card
// Find all instances of:
/*
                    <div>
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
*/
const replacementRender = `                    <div className="flex-1">
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 flex flex-col items-center ml-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Pts</label>
                        <input
                          type="number"
                          min="0"
                          value={getPoints(q)}
                          onChange={(e) => handlePointsChange(q.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}`;

content = content.replace(/<div>\n\s*<h4 className="font-bold text-xs">\{q\.title\}<\/h4>\n\s*<p className="text-\[10px\] text-slate-500 mt-0\.5">\{q\.subtitle\}<\/p>\n\s*<\/div>/g, replacementRender);

fs.writeFileSync('src/components/AdminTab.tsx', content);
console.log("updated");
