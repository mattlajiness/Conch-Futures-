import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(/<span className="text-sm font-bold text-white">/g, 
  '<span className="text-sm font-bold text-white truncate">');

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed team labels.");
