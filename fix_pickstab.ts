import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

// There are two "4. SECTION: DIVISION STANDINGS ORDER". Let's remove the second one completely.
// Let's find their indices.
let firstIndex = content.indexOf('{/* 4. SECTION: DIVISION STANDINGS ORDER */}');
let secondIndex = content.indexOf('{/* 4. SECTION: DIVISION STANDINGS ORDER */}', firstIndex + 1);

if (secondIndex !== -1) {
    let nextSectionIndex = content.indexOf('{/* SECTION: CHAMPIONSHIPS */}', secondIndex);
    if (nextSectionIndex === -1) {
       nextSectionIndex = content.indexOf('{/* Sticky footer Save helper */}', secondIndex);
    }
    
    // Remove everything from secondIndex to nextSectionIndex
    let before = content.substring(0, secondIndex);
    let after = content.substring(nextSectionIndex);
    content = before + after;
    console.log("Removed duplicate standings section.");
}

// Now we need to add the points display to the O/U questions.
// They are inside `ouQuestion &&` block.
// Inside: `<div className="text-xs text-slate-300 font-medium ml-[140px] hidden sm:block">`

let ouHtmlToReplace = `<div className="text-xs text-slate-300 font-medium ml-[140px] hidden sm:block">
                              Win Total: <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                            </div>`;

let newOuHtml = ouHtmlToReplace + `
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full hidden sm:block">
                              +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                            </span>`;

content = content.replace(ouHtmlToReplace, newOuHtml);

let ouMobileHtmlToReplace = `<div className="text-xs text-slate-300 font-medium sm:hidden">
                              Wins: <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                            </div>`;

let newOuMobileHtml = ouMobileHtmlToReplace + `
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full sm:hidden">
                              +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                            </span>`;
                            
content = content.replace(ouMobileHtmlToReplace, newOuMobileHtml);

fs.writeFileSync('src/components/PicksTab.tsx', content);
console.log("Fixed.");
