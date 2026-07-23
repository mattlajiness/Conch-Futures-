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
       return tiebreaker !== "";
    }
    return false;
  };

  const answeredCount`;

content = content.replace('const answeredCount', isStepCompleteFn);

// Now update the step map
content = content.replace(
  'const isPast = idx < currentStepIndex;',
  'const isPast = idx < currentStepIndex;\n            const isComplete = isStepComplete(step);'
);

// update the badge text color
content = content.replace(
  '<div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? \'bg-slate-950 text-teal-400\' : isPast ? \'bg-teal-500 text-slate-950\' : \'bg-slate-700 text-slate-400\'}`}>',
  '<div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? \'bg-slate-950 text-teal-400\' : isComplete ? \'bg-teal-500 text-slate-950\' : \'bg-slate-700 text-slate-400\'}`}>'
);

content = content.replace(
  '{isPast ? <Check className="w-3 h-3" /> : (idx + 1)}',
  '{isComplete ? <Check className="w-3 h-3" /> : (idx + 1)}'
);

// update the pill background color
content = content.replace(
  'isPast ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :',
  'isComplete ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :'
);


fs.writeFileSync('src/components/PicksTab.tsx', content);
