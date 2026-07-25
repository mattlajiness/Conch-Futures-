import * as fs from 'fs';
let content = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');

// Fix comparison on line 106
content = content.replace(
  '} else if (userPick === officialWinner) {',
  '} else if (userPick?.toString().toUpperCase() === officialWinner?.toString().toUpperCase()) {'
);

// Fix comparison on line 434
content = content.replace(
  'isCorrect = userPick && officialWinner && userPick === officialWinner;',
  'isCorrect = userPick && officialWinner && userPick.toString().toUpperCase() === officialWinner.toString().toUpperCase();'
);

// Fix label fallback on line 435 for over_under
// The original line is: const baseLabel = q.options.find((o) => o.value === userPick)?.label || "No pick";
content = content.replace(
  'const baseLabel = q.options.find((o) => o.value === userPick)?.label || "No pick";',
  'const baseLabel = q.options.find((o) => o.value.toUpperCase() === userPick?.toUpperCase())?.label || "No pick";'
);

fs.writeFileSync('src/components/StandingsTab.tsx', content);
