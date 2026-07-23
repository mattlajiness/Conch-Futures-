import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const target = `const newPicks: Picks = {
      userId: user.uid,
      userDisplayName: user.displayName || "Player",
      userPhotoURL: user.photoURL || "",
      selections: selectionsToSave,
      updatedAt: serverTimestamp(),
    };`;
    
const replacement = `const newPicks: Picks = {
      userId: user.uid,
      userDisplayName: user.displayName || "Player",
      userPhotoURL: user.photoURL || "",
      selections: selectionsToSave,
      tiebreaker: tiebreaker,
      updatedAt: serverTimestamp(),
    };`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/PicksTab.tsx', content);
