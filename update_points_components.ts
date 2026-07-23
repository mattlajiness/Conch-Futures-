import * as fs from 'fs';

// Helper function string
const helper = `  const getPoints = (qId: string, defaultPoints: number) => {
    return pool.customPoints?.[qId] !== undefined ? pool.customPoints[qId] : defaultPoints;
  };`;

// PicksTab.tsx
let picks = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
if (!picks.includes('getPoints')) {
  picks = picks.replace('const [saving, setSaving] = useState(false);', 'const [saving, setSaving] = useState(false);\n' + helper);
  picks = picks.replace(/q\.points/g, 'getPoints(q.id, q.points)');
  fs.writeFileSync('src/components/PicksTab.tsx', picks);
}

// ComparePicksTab.tsx
let compare = fs.readFileSync('src/components/ComparePicksTab.tsx', 'utf-8');
if (!compare.includes('getPoints')) {
  compare = compare.replace('const [categoryFilter, setCategoryFilter] = useState<string>("all");', 'const [categoryFilter, setCategoryFilter] = useState<string>("all");\n' + helper);
  compare = compare.replace(/q\.points/g, 'getPoints(q.id, q.points)');
  fs.writeFileSync('src/components/ComparePicksTab.tsx', compare);
}

// StandingsTab.tsx
let standings = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');
if (!standings.includes('getPoints')) {
  standings = standings.replace('const [selectedUserId, setSelectedUserId] = useState<string | null>(null);', 'const [selectedUserId, setSelectedUserId] = useState<string | null>(null);\n' + helper);
  standings = standings.replace(/q\.points/g, 'getPoints(q.id, q.points)');
  fs.writeFileSync('src/components/StandingsTab.tsx', standings);
}

console.log("Updated components");
