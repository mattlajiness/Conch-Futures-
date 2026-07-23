import * as fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');

content = content.replace('picks: Record<string, string>;', 'picks: Record<string, string>;\n  tiebreaker?: string;\n  tiebreakerDiff?: number;');
fs.writeFileSync('src/types.ts', content);
