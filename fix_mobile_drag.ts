import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const moveHandlers = `
  const handleMove = (qId: string, index: number, direction: 'up' | 'down') => {
    const currentOrder = getStandingOrder(qId);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentOrder.length - 1) return;
    
    const newOrder = [...currentOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    handleSelectOption(qId, newOrder.join(","));
  };
`;

content = content.replace(
  'const handleDragStart = (e: React.DragEvent, qId: string, index: number) => {',
  moveHandlers + '\n\n  const handleDragStart = (e: React.DragEvent, qId: string, index: number) => {'
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
