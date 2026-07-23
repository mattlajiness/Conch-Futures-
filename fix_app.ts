import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace('className="flex-grow pb-16"', 'className="flex-grow pb-8"');
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed App");
