import * as fs from 'fs';

let content = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');

const bonusVal = 10; // "Add a points" might mean 10 or 5 or whatever, let's use 10. Or maybe we can make it a specific amount.
const EXACT_ORDER_BONUS = 10;

let countLogic = `if (matches > 0) {
                score += matches * (getPoints(q.id, q.points) / 4);
                if (matches === 4) {
                  score += ${EXACT_ORDER_BONUS}; // Bonus for exact order
                }
                correctCount += matches / 4;
              }`;

content = content.replace(`if (matches > 0) {
                score += matches * (getPoints(q.id, q.points) / 4);
                correctCount += matches / 4;
              }`, countLogic);

let scoreTextLogic = `const basePts = matches * (getPoints(q.id, q.points) / 4);
                      const bonus = matches === 4 ? ${EXACT_ORDER_BONUS} : 0;
                      scoreText = \`\${matches}/4 correct (+\${basePts}\${bonus ? \` and +\${bonus} bonus\` : ''} pts)\`;`;

content = content.replace('scoreText = `${matches}/4 correct (+${matches * (getPoints(q.id, q.points) / 4)} pts)`;', scoreTextLogic);

fs.writeFileSync('src/components/StandingsTab.tsx', content);
console.log("Patched StandingsTab");
