import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// O/U lines in standings
content = content.replace(
  '<div className="flex-1 font-bold text-slate-200">{teamLabel}</div>',
  '<div className="flex-1 flex justify-between items-center pr-2"><span className="font-bold text-slate-200">{teamLabel}</span><span className="text-[10px] text-slate-400 font-mono">O/U {NFL_WIN_TOTALS[teamVal] || 8.5}</span></div>'
);

content = content.replace(
  '<span className="text-sm font-semibold text-slate-300">{opt.label}</span>',
  '<span className="text-sm font-semibold text-slate-300">{opt.label}</span><span className="text-[10px] text-slate-500 font-mono ml-1">({NFL_WIN_TOTALS[opt.value] || 8.5})</span>'
);

// Bracket size reductions
content = content.replace(
  'className="bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-700/50 flex flex-col items-center"',
  'className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center"'
);

// AFC img
content = content.replace(
  '<div className="h-24 flex items-center justify-center mt-2">',
  '<div className="h-16 flex items-center justify-center mt-1">'
);
content = content.replace(
  'className="w-20 h-20 object-contain drop-shadow-xl animate-in zoom-in duration-300"',
  'className="w-16 h-16 object-contain drop-shadow-xl animate-in zoom-in duration-300"'
);
content = content.replace(
  'className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs text-center p-2"',
  'className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] text-center p-1"'
);

// NFC img
content = content.replace(
  '<div className="h-24 flex items-center justify-center mt-2">',
  '<div className="h-16 flex items-center justify-center mt-1">'
);
content = content.replace(
  'className="w-20 h-20 object-contain drop-shadow-xl animate-in zoom-in duration-300"',
  'className="w-16 h-16 object-contain drop-shadow-xl animate-in zoom-in duration-300"'
);
content = content.replace(
  'className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs text-center p-2"',
  'className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] text-center p-1"'
);

// VS connector padding
content = content.replace(
  'className="hidden md:flex flex-col items-center justify-center h-full pt-16"',
  'className="hidden md:flex flex-col items-center justify-center h-full pt-12"'
);

// Super bowl container
content = content.replace(
  '<div className="w-full max-w-sm mt-4 relative z-10 flex flex-col items-center space-y-3">',
  '<div className="w-full max-w-sm mt-2 relative z-10 flex flex-col items-center space-y-2">'
);
content = content.replace(
  '<div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 shadow-2xl mb-3">',
  '<div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 shadow-2xl mb-1">'
);
content = content.replace(
  '<Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />',
  '<Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />'
);

// SB Img
content = content.replace(
  '<div className="h-32 flex items-center justify-center mt-4">',
  '<div className="h-20 flex items-center justify-center mt-2">'
);
content = content.replace(
  'className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-10"',
  'className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-10"'
);
content = content.replace(
  'className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-dashed border-amber-500/30 flex items-center justify-center text-amber-500/50 text-xs text-center p-4"',
  'className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-dashed border-amber-500/30 flex items-center justify-center text-amber-500/50 text-[10px] text-center p-2"'
);

// Shrink header size to save space
content = content.replace(
  '<h2 className="text-2xl font-extrabold text-white mb-2">Championship Bracket</h2>',
  '<h2 className="text-xl font-extrabold text-white mb-1">Championship Bracket</h2>'
);
content = content.replace(
  '<div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-8">',
  '<div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-4">'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
