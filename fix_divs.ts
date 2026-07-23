import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');
content = content.replace(
  '</div> */}\n                 </div>\n               </div>',
  '</div> */}'
);
fs.writeFileSync('src/components/PicksTab.tsx', content);
