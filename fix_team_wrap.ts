import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const targetLayout = `<div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5 w-32 shrink-0 pointer-events-none">`;
const replacementLayout = `<div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                          <div className="flex flex-col gap-0.5 w-full sm:w-32 shrink-0 pointer-events-none">`;

content = content.replace(targetLayout, replacementLayout);

// Also remove truncate from team names
content = content.replace(/<span className="text-sm font-bold text-white truncate">/g, 
  '<span className="text-sm font-bold text-white">');

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed team wrap");
