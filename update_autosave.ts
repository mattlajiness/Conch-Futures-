import * as fs from 'fs';
let content = fs.readFileSync('src/components/PicksTab.tsx', 'utf-8');

const importReplacement = `import { doc, setDoc, serverTimestamp } from "firebase/firestore";`;
const newImportReplacement = `import { doc, setDoc, serverTimestamp } from "firebase/firestore";\nimport { CheckCircle2, Loader2 } from "lucide-react";`;
if (!content.includes('CheckCircle2')) {
  content = content.replace(importReplacement, newImportReplacement);
}

const stateToAdd = `  const [autosaving, setAutosaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState<Date | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);`;

if (!content.includes('autosaving')) {
  content = content.replace(
    'const scrollRef = useRef<HTMLDivElement>(null);',
    'const scrollRef = useRef<HTMLDivElement>(null);\n' + stateToAdd
  );
}

const autoSaveEffect = `
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    
    // Don't auto-save if everything is empty
    if (Object.keys(selections).length === 0 && !tiebreaker) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      setAutosaving(true);
      const path = \`pools/\${pool.id}/picks/\${user.uid}\`;
      const selectionsToSave = { ...selections };

      standingsQuestions.forEach(q => {
        if (!selectionsToSave[q.id]) {
          selectionsToSave[q.id] = q.options.map(o => o.value).join(",");
        }
      });

      const newPicks: Picks = {
        userId: user.uid,
        userDisplayName: user.displayName || "Player",
        userPhotoURL: user.photoURL || "",
        selections: selectionsToSave,
        tiebreaker,
        updatedAt: new Date(),
      };

      try {
        await setDoc(doc(db, path), {
          userId: user.uid,
          userDisplayName: user.displayName || "Player",
          userPhotoURL: user.photoURL || "",
          selections: selectionsToSave,
          tiebreaker,
          updatedAt: serverTimestamp(),
        });
        setLastAutosaveTime(new Date());
        onPicksSaved(newPicks);
      } catch (err: any) {
        console.error("Autosave error", err);
      } finally {
        setAutosaving(false);
      }
    }, 1500);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [selections, tiebreaker]);
`;

if (!content.includes('autosaveTimeoutRef.current = setTimeout')) {
  content = content.replace(
    'const handleSelectOption = (questionId: string, value: string) => {',
    autoSaveEffect + '\n  const handleSelectOption = (questionId: string, value: string) => {'
  );
}

const uiIndicator = `
      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center sticky bottom-0 bg-[#09222c] pb-2 z-20">
        <div className="absolute -top-6 right-2 flex items-center gap-1.5 text-xs">
          {autosaving ? (
            <span className="text-slate-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : lastAutosaveTime ? (
            <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>
          ) : null}
        </div>
`;

content = content.replace(
  '{/* Navigation Buttons */}\n      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center sticky bottom-0 bg-[#09222c] pb-2 z-20">',
  uiIndicator
);

fs.writeFileSync('src/components/PicksTab.tsx', content);
