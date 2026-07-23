import * as fs from 'fs';

let content = fs.readFileSync('src/components/ComparePicksTab.tsx', 'utf-8');

content = content.replace(/<span className=\{\`text-\[11px\] font-semibold block truncate \$\{userChoice \? "text-white" : "text-slate-600 italic"\}\`\}>/g, 
  '<span className={`text-[11px] font-semibold block ${userChoice ? "text-white" : "text-slate-600 italic"}`}>');

fs.writeFileSync('src/components/ComparePicksTab.tsx', content);
console.log("Fixed compare tab wrap");
