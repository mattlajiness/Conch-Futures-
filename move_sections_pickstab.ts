import fs from 'fs';

const content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const s2 = content.indexOf('{/* 2. SECTION: DIVISION CHAMPIONS */}');
const s3 = content.indexOf('{/* 3. SECTION: OVER / UNDER WIN TOTALS */}');
const s4 = content.indexOf('{/* 4. SECTION: DIVISION STANDINGS ORDER */}');
const sEnd = content.indexOf('</div>\n    </div>\n  );\n}');

if (s2 !== -1 && s3 !== -1 && s4 !== -1 && sEnd !== -1) {
  const p1 = content.slice(0, s3);
  const p2 = content.slice(s3, s4); // over under
  const p3 = content.slice(s4, sEnd); // standings
  const pEnd = content.slice(sEnd);

  // new order: ..., p1, p3 (standings), p2 (over under), pEnd
  const newContent = p1 + p3 + p2 + pEnd;
  fs.writeFileSync('src/components/PicksTab.tsx', newContent);
  console.log("Success PicksTab");
} else {
  console.log("Failed", s2, s3, s4, sEnd);
}
