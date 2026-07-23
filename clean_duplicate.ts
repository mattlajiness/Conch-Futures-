import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

let startIndex = content.indexOf('{/* 4. SECTION: DIVISION STANDINGS ORDER */}');
let endIndex = content.indexOf('{/* SECTION: CHAMPIONSHIPS */}');

if (startIndex !== -1 && endIndex !== -1) {
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex);
    content = before + after;
    fs.writeFileSync('src/components/PicksTab.tsx', content);
    console.log("Deleted duplicate block successfully");
} else {
    console.log("Could not find blocks");
}

