import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  'setMessage({ type: "error", text: handleFirestoreError(err) });',
  'setMessage({ type: "error", text: handleFirestoreError(err, OperationType.WRITE, path) });'
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
