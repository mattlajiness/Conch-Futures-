import * as fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace('selections: Record<string, string>; // Map of categoryId -> selectedOption', 'selections: Record<string, string>; // Map of categoryId -> selectedOption\n  tiebreaker?: string;');
fs.writeFileSync('src/types.ts', content);
