import * as fs from 'fs';
let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

content = content.replace('const [results, setResults] = useState<Record<string, string>>({});', 'const [results, setResults] = useState<Record<string, string>>({});\n  const [tiebreakerResult, setTiebreakerResult] = useState<string>("");');
content = content.replace('setResults(pool.results);', 'setResults(pool.results);\n      if (pool.tiebreakerResult) setTiebreakerResult(pool.tiebreakerResult);');

fs.writeFileSync('src/components/AdminTab.tsx', content);
