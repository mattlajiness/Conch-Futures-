import * as fs from 'fs';
let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

const target1 = `await updateDoc(doc(db, path), {
        results,
      });`;
const rep1 = `await updateDoc(doc(db, path), {
        results,
        tiebreakerResult,
      });`;

const target2 = `const updatedPool: Pool = {
        ...pool,
        results,
      };`;
const rep2 = `const updatedPool: Pool = {
        ...pool,
        results,
        tiebreakerResult,
      };`;

content = content.replace(target1, rep1).replace(target2, rep2);
fs.writeFileSync('src/components/AdminTab.tsx', content);
