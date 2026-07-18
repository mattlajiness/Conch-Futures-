import fs from 'fs';
const content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
console.log(content.substring(0, 1500));
