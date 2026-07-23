import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  'onPointerDown={(e) => e.stopPropagation()}',
  'onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}'
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
