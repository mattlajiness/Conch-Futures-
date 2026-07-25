import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace(/handleSelectOption\(\`ou_\$\{teamVal\.toLowerCase\(\)\}\`, 'over'\)/g, "handleSelectOption(`ou_${teamVal.toLowerCase()}`, 'OVER')");
content = content.replace(/handleSelectOption\(\`ou_\$\{teamVal\.toLowerCase\(\)\}\`, 'under'\)/g, "handleSelectOption(`ou_${teamVal.toLowerCase()}`, 'UNDER')");
content = content.replace(/=== 'over'/g, "=== 'OVER'");
content = content.replace(/=== 'under'/g, "=== 'UNDER'");

fs.writeFileSync('src/components/PicksTab.tsx', content);
