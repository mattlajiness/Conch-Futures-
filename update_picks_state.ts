import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

content = content.replace('const [selections, setSelections] = useState<Record<string, string>>({});', 'const [selections, setSelections] = useState<Record<string, string>>({});\n  const [tiebreaker, setTiebreaker] = useState<string>("");');

content = content.replace('setSelections(userPicks.selections);', 'setSelections(userPicks.selections);\n      if (userPicks.tiebreaker) setTiebreaker(userPicks.tiebreaker);');

fs.writeFileSync('src/components/PicksTab.tsx', content);
