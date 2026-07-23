import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// Side-by-side on mobile
content = content.replace(
  'className="flex flex-col md:flex-row w-full justify-around items-center md:items-start gap-4 md:gap-8 relative z-10"',
  'className="flex flex-row w-full justify-between sm:justify-around items-start gap-2 sm:gap-8 relative z-10"'
);

// Shorten select options for mobile
content = content.replace(
  '<option value="" disabled className="text-slate-600">-- Select AFC Champion --</option>',
  '<option value="" disabled className="text-slate-600">-- AFC Champ --</option>'
);
content = content.replace(
  '<option value="" disabled className="text-slate-600">-- Select NFC Champion --</option>',
  '<option value="" disabled className="text-slate-600">-- NFC Champ --</option>'
);

// Remove the vertical VS connector on mobile
content = content.replace(
  '<div className="md:hidden w-full h-px bg-slate-700 my-4 relative">',
  '<!-- <div className="md:hidden w-full h-px bg-slate-700 my-4 relative">'
);
content = content.replace(
  '<span className="bg-slate-900 px-3 text-slate-500 text-xs font-bold uppercase tracking-widest">VS</span>',
  '<span className="bg-slate-900 px-3 text-slate-500 text-xs font-bold uppercase tracking-widest">VS</span></div> -->'
);

// Replace the VS connector on desktop to be visible on mobile too!
content = content.replace(
  '<div className="hidden md:flex flex-col items-center justify-center h-full pt-12">',
  '<div className="flex flex-col items-center justify-center h-full pt-12">'
);

// Adjust select padding to fit mobile
content = content.replace(
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors font-bold cursor-pointer text-center appearance-none"',
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition-colors font-bold cursor-pointer text-center appearance-none"'
);
content = content.replace(
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer text-center appearance-none"',
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer text-center appearance-none"'
);
content = content.replace(
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-4 text-white text-base focus:outline-none focus:border-amber-500 transition-colors font-extrabold cursor-pointer text-center appearance-none"',
  'className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-amber-500 transition-colors font-extrabold cursor-pointer text-center appearance-none"'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
