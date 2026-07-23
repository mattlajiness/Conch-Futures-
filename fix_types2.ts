import * as fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace('results?: Record<string, string>;', 'results?: Record<string, string>;\n  tiebreakerResult?: string;');
fs.writeFileSync('src/types.ts', content);
