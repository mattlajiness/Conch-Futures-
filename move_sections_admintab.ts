import * as fs from 'fs';

let content = fs.readFileSync('src/components/AdminTab.tsx', 'utf-8');

// The rendering section for Awards:
const awardRegex = /\{\/\* Awards category \*\/\}.*?\{\/\* Division Champions Category \*\/\}/s;
const awardMatch = content.match(awardRegex);

if (awardMatch) {
    let awardStr = awardMatch[0].replace('{/* Division Champions Category */}', '');
    
    let champStr = awardStr.replace('Awards category', 'Championships category');
    champStr = champStr.replace('categoryFilter === "award"', 'categoryFilter === "championship"');
    champStr = champStr.replace('NFL Championships & Awards', 'NFL Championships');
    champStr = champStr.replace(/awardsQuestions/g, 'championshipQuestions');
    champStr = champStr.replace('handleSelectAllCategory("award")', 'handleSelectAllCategory("championship")');
    champStr = champStr.replace('handleClearCategory("award")', 'handleClearCategory("championship")');
    champStr = champStr.replace('Award className', 'Trophy className');

    let newAwardStr = awardStr.replace('Awards category', 'Player Awards category');
    newAwardStr = newAwardStr.replace('NFL Championships & Awards', 'NFL Player Awards');

    const standingsRegex = /\{\/\* Division Champions Category \*\/\}.*?\{\/\* Over \/ Under Category \*\/\}/s;
    const standingsMatch = content.match(standingsRegex);

    if (standingsMatch) {
        let standingsStr = standingsMatch[0].replace('{/* Over / Under Category */}', '');
        
        let ouRegex = /\{\/\* Over \/ Under Category \*\/\}.*?<\/div>\n      \)\}\n\n          \{\/\* activeQuestionsList\.length === 0/s;
        let ouMatch = content.match(ouRegex);
        
        let ouStr = '';
        if (ouMatch) {
            ouStr = ouMatch[0].replace('          {/* activeQuestionsList.length === 0', '');
        }

        // Remove old sections
        let newContent = content.replace(awardRegex, '');
        newContent = newContent.replace(standingsRegex, '');
        newContent = newContent.replace(ouRegex, '          {/* activeQuestionsList.length === 0');
        
        const sectionsToInject = standingsStr + '\n' + ouStr + '\n' + champStr + '\n' + newAwardStr + '\n';
        
        newContent = newContent.replace('          {/* activeQuestionsList.length === 0', sectionsToInject + '          {/* activeQuestionsList.length === 0');
        
        if (!newContent.includes('Trophy,')) {
            newContent = newContent.replace('import { Award, Check, Settings, Trash2, ListOrdered, ShieldAlert } from "lucide-react";', 'import { Award, Check, Settings, Trash2, ListOrdered, ShieldAlert, Trophy } from "lucide-react";');
        }
        
        // Add championshipQuestions filter
        if(!newContent.includes('championshipQuestions = FUTURES_QUESTIONS.filter')) {
            newContent = newContent.replace('const awardsQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "award");', 'const awardsQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "award");\n  const championshipQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "championship");');
            newContent = newContent.replace('if (category === "award") ids = awardsQuestions.map((q) => q.id);', 'if (category === "award") ids = awardsQuestions.map((q) => q.id);\n    if (category === "championship") ids = championshipQuestions.map((q) => q.id);');
        }

        fs.writeFileSync('src/components/AdminTab.tsx', newContent);
        console.log("AdminTab updated");
    } else {
        console.log("Standings section not found");
    }
} else {
    console.log("Award section not found");
}
