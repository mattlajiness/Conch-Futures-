import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// replace flex-col sm:flex-row with flex-row
content = content.replace(
  'className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center pr-2 gap-1 sm:gap-2"',
  'className="flex-1 flex flex-row justify-between items-center pr-1 sm:pr-2 gap-1 sm:gap-2"'
);

// replace the inner container mobile wrapping
content = content.replace(
  'className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 w-full sm:w-auto"',
  'className="flex items-center justify-end gap-1 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0"'
);

// make team label truncate just in case
content = content.replace(
  '<span className="font-bold text-slate-200">{teamLabel}</span>',
  '<span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>'
);

// adjust gap of the row parent
content = content.replace(
  'className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${',
  'className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${'
);


fs.writeFileSync('src/components/PicksTab.tsx', content);
