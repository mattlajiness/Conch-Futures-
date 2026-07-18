import fs from 'fs';

const content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

const s3 = content.indexOf('          {/* 3. OVER / UNDER WIN TOTALS */}');
const s4 = content.indexOf('          {/* 4. DIVISION STANDINGS ORDER */}');
const sEnd = content.indexOf('          {activeQuestionsList.length === 0 && (');

if (s3 !== -1 && s4 !== -1 && sEnd !== -1) {
  const p1 = content.slice(0, s3);
  const p2 = content.slice(s3, s4); // over under
  const p3 = content.slice(s4, sEnd); // standings
  const pEnd = content.slice(sEnd);

  // new order: ..., p1, p3 (standings), p2 (over under), pEnd
  const newContent = p1 + p3 + p2 + pEnd;
  fs.writeFileSync('src/components/AdminTab.tsx', newContent);
  console.log("Success AdminTab results sections");
} else {
  console.log("Failed AdminTab results sections", s3, s4, sEnd);
}

