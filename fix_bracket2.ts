import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// Reduce vertical gaps on mobile
content = content.replace(
  'items-center w-full max-w-xs space-y-3',
  'items-center w-full max-w-xs space-y-2'
);
content = content.replace(
  'items-center w-full max-w-xs space-y-3', // NFC
  'items-center w-full max-w-xs space-y-2'
);

content = content.replace(
  'md:hidden w-full h-px bg-slate-700 my-8 relative',
  'md:hidden w-full h-px bg-slate-700 my-4 relative'
);

content = content.replace(
  'w-full max-w-sm mt-4 relative z-10 flex flex-col items-center space-y-3', // Super Bowl
  'w-full max-w-sm mt-2 relative z-10 flex flex-col items-center space-y-2'
);

content = content.replace(
  '<h3 className="font-extrabold text-amber-400 text-xl uppercase tracking-widest">Super Bowl</h3>',
  '<h3 className="font-extrabold text-amber-400 text-lg uppercase tracking-widest">Super Bowl</h3>'
);

// Reduce spacing above the bracket
content = content.replace(
  '<div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-8">',
  '<div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-4">'
);
content = content.replace(
  '<div className="bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-700/50 flex flex-col items-center">',
  '<div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center">'
);


fs.writeFileSync('src/components/PicksTab.tsx', content);
