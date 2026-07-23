import * as fs from 'fs';

function replaceAll(file: string, replacements: [RegExp, string][]) {
  let content = fs.readFileSync(file, 'utf-8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(file, content);
}

// PicksTab
replaceAll('src/components/PicksTab.tsx', [
  [/p-5/g, 'p-3'],
  [/p-4/g, 'p-2.5'],
  [/gap-6/g, 'gap-3'],
  [/gap-4/g, 'gap-2.5'],
  [/gap-3/g, 'gap-2'],
  [/mb-8/g, 'mb-4'],
  [/mb-6/g, 'mb-3'],
  [/mb-4/g, 'mb-2'],
  [/mt-10/g, 'mt-4'],
  [/mt-8/g, 'mt-4'],
  [/mt-6/g, 'mt-3'],
  [/py-3/g, 'py-1.5'],
  [/py-2\.5/g, 'py-1.5'],
  [/py-2/g, 'py-1'],
  [/px-5/g, 'px-3'],
  [/px-4/g, 'px-2.5'],
  [/px-3\.5/g, 'px-2'],
  [/px-3/g, 'px-2'],
  [/text-sm/g, 'text-xs'],
  [/text-lg/g, 'text-base'],
  [/text-base/g, 'text-sm'],
]);

// StandingsTab
replaceAll('src/components/StandingsTab.tsx', [
  [/p-5/g, 'p-3'],
  [/p-4/g, 'p-2.5'],
  [/gap-8/g, 'gap-4'],
  [/gap-6/g, 'gap-3'],
  [/gap-4/g, 'gap-2.5'],
  [/gap-3/g, 'gap-2'],
  [/mb-8/g, 'mb-4'],
  [/mb-6/g, 'mb-3'],
  [/mb-4/g, 'mb-2'],
  [/mt-8/g, 'mt-4'],
  [/mt-6/g, 'mt-3'],
  [/py-3/g, 'py-1.5'],
  [/py-2\.5/g, 'py-1.5'],
  [/py-2/g, 'py-1'],
  [/px-4/g, 'px-2.5'],
  [/px-3/g, 'px-2'],
]);

// ComparePicksTab
replaceAll('src/components/ComparePicksTab.tsx', [
  [/p-5/g, 'p-3'],
  [/p-4/g, 'p-2.5'],
  [/gap-8/g, 'gap-4'],
  [/gap-6/g, 'gap-3'],
  [/gap-4/g, 'gap-2.5'],
  [/gap-3/g, 'gap-2'],
  [/mb-8/g, 'mb-4'],
  [/mb-6/g, 'mb-3'],
  [/mb-4/g, 'mb-2'],
  [/py-3/g, 'py-1.5'],
  [/py-2/g, 'py-1'],
  [/px-4/g, 'px-2.5'],
  [/px-3/g, 'px-2'],
]);

// AdminTab
replaceAll('src/components/AdminTab.tsx', [
  [/p-5/g, 'p-3'],
  [/p-4/g, 'p-2.5'],
  [/gap-8/g, 'gap-4'],
  [/gap-6/g, 'gap-3'],
  [/gap-4/g, 'gap-2.5'],
  [/gap-3/g, 'gap-2'],
  [/mb-8/g, 'mb-4'],
  [/mb-6/g, 'mb-3'],
  [/mb-4/g, 'mb-2'],
  [/py-3/g, 'py-1.5'],
  [/py-2\.5/g, 'py-1.5'],
  [/py-2/g, 'py-1'],
  [/px-5/g, 'px-3'],
  [/px-4/g, 'px-2.5'],
  [/px-3/g, 'px-2'],
]);

// PoolDetail
replaceAll('src/components/PoolDetail.tsx', [
  [/p-6/g, 'p-3'],
  [/p-5/g, 'p-2.5'],
  [/p-4/g, 'p-2'],
  [/gap-6/g, 'gap-3'],
  [/gap-5/g, 'gap-2.5'],
  [/gap-4/g, 'gap-2'],
  [/mb-8/g, 'mb-4'],
  [/mb-6/g, 'mb-3'],
  [/mb-4/g, 'mb-2'],
  [/py-6/g, 'py-3'],
  [/py-4/g, 'py-2'],
  [/py-2\.5/g, 'py-1.5'],
  [/py-2/g, 'py-1'],
  [/px-6/g, 'px-3'],
  [/px-4/g, 'px-2'],
  [/px-3/g, 'px-1.5'],
]);

console.log("Applied tight UI compressions.");
