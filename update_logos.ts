import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// Update AFC logo
content = content.replace(
  '<h3 className="font-extrabold text-lg text-rose-400 uppercase tracking-widest drop-shadow-sm">AFC</h3>',
  '<img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/American_Football_Conference_logo.svg" alt="AFC" className="w-12 h-12 mb-1 drop-shadow-md" referrerPolicy="no-referrer" />'
);

// Update NFC logo
content = content.replace(
  '<h3 className="font-extrabold text-lg text-indigo-400 uppercase tracking-widest drop-shadow-sm">NFC</h3>',
  '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/National_Football_Conference_logo.svg" alt="NFC" className="w-12 h-12 mb-1 drop-shadow-md" referrerPolicy="no-referrer" />'
);

// Update Super Bowl logo
content = content.replace(
  '<div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 shadow-2xl mb-1">\n                        <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />\n                      </div>\n                      <h3 className="font-extrabold text-amber-400 text-lg uppercase tracking-widest">Super Bowl</h3>',
  '<img src="https://upload.wikimedia.org/wikipedia/en/e/ed/Super_Bowl_LXI_Logo.svg" alt="Super Bowl LXI" className="w-24 h-auto drop-shadow-2xl mb-2" referrerPolicy="no-referrer" />'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
