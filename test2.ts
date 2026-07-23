import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const isStepCompleteFn = `
  const isStepComplete = (step: any) => {
    if (step.category === 'standings') {
      const q = activeQuestionsList.find(q => q.id === step.id);
      if (!q) return false;
      const order = getStandingOrder(q.id);
      const isStandingsFilled = order.every(t => t !== "");
      const isOuFilled = q.options.every(opt => !!selections[\`ou_\${opt.value.toLowerCase()}\`]);
      return isStandingsFilled && isOuFilled;
    } else if (step.category === 'championship') {
       return !!selections['afc_champ'] && !!selections['nfc_champ'] && !!selections['super_bowl'];
    } else if (step.category === 'award') {
       const awardQs = activeQuestionsList.filter(q => q.category === 'award');
       return awardQs.every(q => !!selections[q.id]);
    } else if (step.category === 'submit') {
       return tiebreaker !== "" && Object.values(selections).filter(Boolean).length === activeQuestionsList.length;
    }
    return false;
  };

  const answeredCount`;

content = content.replace(/const isStepComplete = \(step: any\) => \{[\s\S]*?const answeredCount/m, isStepCompleteFn);

fs.writeFileSync('src/components/PicksTab.tsx', content);
