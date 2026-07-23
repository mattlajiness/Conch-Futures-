import * as fs from 'fs';

let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

content = content.replace(`await updateDoc(doc(db, path), {
        activeQuestions,
      });`, `await updateDoc(doc(db, path), {
        activeQuestions,
        customPoints,
      });`);

content = content.replace(`const updatedPool: Pool = {
        ...pool,
        activeQuestions,
      };`, `const updatedPool: Pool = {
        ...pool,
        activeQuestions,
        customPoints,
      };`);

fs.writeFileSync('src/components/AdminTab.tsx', content);
console.log("Fixed save");
