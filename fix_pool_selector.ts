import * as fs from 'fs';

let content = fs.readFileSync('src/components/PoolSelector.tsx', 'utf-8');
content = content.replace('className="max-w-4xl mx-auto py-8 px-4 sm:px-6"', 'className="max-w-4xl mx-auto py-4 px-2 sm:px-4"');
content = content.replace('className="relative overflow-hidden bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl"', 'className="relative overflow-hidden bg-[#09222c] border border-[#113a4b]/80 rounded-xl p-4 sm:p-6 mb-6 shadow-xl"');

fs.writeFileSync('src/components/PoolSelector.tsx', content);
console.log("Fixed PoolSelector");
