import * as fs from 'fs';

let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const awardSectionRegex = /\{\/\* 1\. SECTION: CHAMPIONSHIPS & AWARD FUTURES \*\/\}.*?\{\/\* 4\. SECTION: DIVISION STANDINGS ORDER \*\/\}/s;
const awardSectionMatch = content.match(awardSectionRegex);
if (!awardSectionMatch) throw new Error("Could not find section 1");

let awardSection = awardSectionMatch[0].replace('{/* 4. SECTION: DIVISION STANDINGS ORDER */}', '');

// Create championships section from award section
let champSection = awardSection.replace('1. SECTION: CHAMPIONSHIPS & AWARD FUTURES', 'SECTION: CHAMPIONSHIPS');
champSection = champSection.replace('categoryFilter === "award"', 'categoryFilter === "championship"');
champSection = champSection.replace('NFL Championships & Major Awards', 'NFL Championships');
champSection = champSection.replace('awardsQuestions.map', 'championshipQuestions.map');
champSection = champSection.replace('Award className', 'Trophy className'); // Let's use Trophy

// Create new award section from award section
let newAwardSection = awardSection.replace('1. SECTION: CHAMPIONSHIPS & AWARD FUTURES', 'SECTION: PLAYER AWARDS');
newAwardSection = newAwardSection.replace('NFL Championships & Major Awards', 'NFL Major Awards');

const standingsSectionRegex = /\{\/\* 4\. SECTION: DIVISION STANDINGS ORDER \*\/\}.*?\{\/\* Sticky footer Save helper \*\/\}/s;
const standingsSectionMatch = content.match(standingsSectionRegex);
if (!standingsSectionMatch) throw new Error("Could not find section 4");

let standingsSection = standingsSectionMatch[0].replace('{/* Sticky footer Save helper */}', '');

// Order should be: Standings, then Championships, then Awards
let newContent = content.replace(awardSectionRegex, '');
newContent = newContent.replace(standingsSectionRegex, '{/* Sticky footer Save helper */}');

const injectionPoint = '{/* Sticky footer Save helper */}';
const sectionsToInject = standingsSection + '\n\n' + champSection + '\n\n' + newAwardSection + '\n\n' + injectionPoint;

newContent = newContent.replace(injectionPoint, sectionsToInject);

// Make sure we import Trophy
if (!newContent.includes('Trophy,')) {
    newContent = newContent.replace('import { Save, Check, Award, Compass, ShieldAlert, Zap, ListOrdered, GripVertical }', 'import { Save, Check, Award, Compass, ShieldAlert, Zap, ListOrdered, GripVertical, Trophy }');
}

fs.writeFileSync('src/components/PicksTab.tsx', newContent);
console.log("Done");
