import React, { useState, useEffect, useRef } from "react";
import { FUTURES_QUESTIONS, NFL_TEAMS_ALL, AFC_TEAMS, NFC_TEAMS, NFL_WIN_TOTALS } from "../constants";
import { Save, Check, Award, Compass, ShieldAlert, Zap, ListOrdered, GripVertical, Trophy, ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, Loader2 } from "lucide-react";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { Picks, Pool } from "../types";
import { TeamStandingInfo } from "../lib/nflApi";

interface PicksTabProps {
  pool: Pool;
  user: any;
  userPicks: Picks | null;
  onPicksSaved: (newPicks: Picks) => void;
  categoryFilter?: string;
  nflStandings?: Record<string, TeamStandingInfo>;
}

const WIZARD_STEPS = [
  { id: 'standings_afc_east', label: 'AFC East', category: 'standings' },
  { id: 'standings_afc_north', label: 'AFC North', category: 'standings' },
  { id: 'standings_afc_south', label: 'AFC South', category: 'standings' },
  { id: 'standings_afc_west', label: 'AFC West', category: 'standings' },
  { id: 'standings_nfc_east', label: 'NFC East', category: 'standings' },
  { id: 'standings_nfc_north', label: 'NFC North', category: 'standings' },
  { id: 'standings_nfc_south', label: 'NFC South', category: 'standings' },
  { id: 'standings_nfc_west', label: 'NFC West', category: 'standings' },
  { id: 'playoffs', label: 'Playoffs', category: 'championship' },
  { id: 'awards', label: 'Awards', category: 'award' },
  // { id: 'ou', label: 'Win Totals', category: 'over_under' },
  { id: 'submit', label: 'Review & Submit', category: 'submit' }
];

export default function PicksTab({ pool, user, userPicks, onPicksSaved, nflStandings }: PicksTabProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [tiebreaker, setTiebreaker] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autosaving, setAutosaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState<Date | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);

  const activeQuestionsList = FUTURES_QUESTIONS;
  const standingsQuestions = activeQuestionsList.filter((q) => q.category === "standings");
  const awardsQuestions = activeQuestionsList.filter((q) => q.category === "award");
  const ouQuestions = activeQuestionsList.filter((q) => q.category === "over_under");

  const getStandingOrder = (qId: string, sels = selections): string[] => {
    const q = activeQuestionsList.find(q => q.id === qId);
    if (!q) return [];
    const val = sels[qId];
    if (val) return val.split(",");
    return q.options.map((o) => "");
  };
  
  const isStepComplete = (step: any, sels = selections, tbreak = tiebreaker) => {
    if (step.category === 'standings') {
      const q = activeQuestionsList.find(q => q.id === step.id);
      if (!q) return false;
      const order = getStandingOrder(q.id, sels);
      const isStandingsFilled = order.every(t => t !== "");
      const isOuFilled = q.options.every(opt => !!sels[`ou_${opt.value.toLowerCase()}`]);
      return isStandingsFilled && isOuFilled;
    } else if (step.category === 'championship') {
       return !!sels['afc_champ'] && !!sels['nfc_champ'] && !!sels['super_bowl'];
    } else if (step.category === 'award') {
       const awardQs = activeQuestionsList.filter(q => q.category === 'award');
       return awardQs.every(q => !!sels[q.id]);
    } else if (step.category === 'submit') {
       return tbreak !== "" && Object.values(sels).filter(Boolean).length === activeQuestionsList.length;
    }
    return false;
  };


  const getPoints = (qId: string, defaultPoints: number) => {
    return pool.customPoints?.[qId] !== undefined ? pool.customPoints[qId] : defaultPoints;
  };

  const [draggedItem, setDraggedItem] = useState<{ qId: string; index: number } | null>(null);

  
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


  const handleDragStart = (e: React.DragEvent, qId: string, index: number) => {
    setDraggedItem({ qId, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, qId: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.qId !== qId || draggedItem.index === targetIndex) return;
    const currentOrder = getStandingOrder(qId);
    const newOrder = [...currentOrder];
    
    const [removed] = newOrder.splice(draggedItem.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    handleSelectOption(qId, newOrder.join(","));
    setDraggedItem(null);
  };

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (userPicks?.selections) {
      setSelections(userPicks.selections);
      if (userPicks.tiebreaker) setTiebreaker(userPicks.tiebreaker);
      
      const firstIncompleteIndex = WIZARD_STEPS.findIndex(step => !isStepComplete(step, userPicks.selections, userPicks.tiebreaker || ""));
      if (firstIncompleteIndex !== -1) {
         setCurrentStepIndex(firstIncompleteIndex);
      } else {
         setCurrentStepIndex(WIZARD_STEPS.length - 1);
      }
    } else {
      setSelections({});
      setCurrentStepIndex(0);
    }
  }, [userPicks]);

  
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
      const path = `pools/${pool.id}/picks/${user.uid}`;
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

  const handleSelectOption = (questionId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };


  const answeredCount = Object.values(selections).filter(Boolean).length;
  const totalQuestions = activeQuestionsList.length;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const path = `pools/${pool.id}/picks/${user.uid}`;
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
      setMessage({ type: "success", text: "Picks locked in securely!" });
      onPicksSaved(newPicks);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: handleFirestoreError(err, OperationType.WRITE, path) });
    } finally {
      setSaving(false);
    }
  };

  // Scroll active step into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[currentStepIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentStepIndex]);

  const currentStep = WIZARD_STEPS[currentStepIndex];

  return (
    <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-4 sm:p-6 shadow-xl relative min-h-[600px] flex flex-col">
      {/* Pizza Tracker */}
      <div className="mb-6">
        <div 
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent"
        >
          {WIZARD_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            const isComplete = isStepComplete(step);
            return (
              <div 
                key={step.id} 
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  isActive ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_-3px_rgba(20,184,166,0.5)]" :
                  isComplete ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :
                  "bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:bg-slate-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? 'bg-slate-950 text-teal-400' : isComplete ? 'bg-teal-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                  {isComplete ? <Check className="w-3 h-3" /> : (idx + 1)}
                </div>
                {step.label}
              </div>
            );
          })}
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
           <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500" style={{ width: `${((currentStepIndex + 1) / WIZARD_STEPS.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1">
        {/* STANDINGS STEPS */}
        {currentStep.category === 'standings' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {standingsQuestions.filter(q => q.id === currentStep.id).map(q => {
               const currentOrder = getStandingOrder(q.id);
               const isFullyFilled = currentOrder.every((t) => t !== "");
               return (
                 <div key={q.id} className="space-y-4 max-w-2xl mx-auto">
                    <div className="text-center mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">{q.title}</h2>
                      <p className="text-slate-400 text-xs sm:text-sm mb-2 max-w-md mx-auto">
                        Drag and drop to reorder from 1st to 4th place, and select Over or Under for each team's win total.
                      </p>
                      <div className="inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] sm:text-xs font-mono font-bold">
                        +{getPoints(q.id, q.points) / 4} PTS per spot (+10 PTS Bonus for exact 1-4 order)
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-2 sm:p-4 rounded-xl border border-slate-700/50">
                      <div className="space-y-2 relative">
                        {currentOrder.map((teamVal, index) => {
                          const slotNum = index + 1;
                          const teamLabel = q.options.find((o) => o.value === teamVal)?.label || "Unassigned";
                          const isFilled = teamVal !== "";
                          return (
                            <div
                              key={`${q.id}-slot-${index}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, q.id, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDrop(e, q.id, index)}
                              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${
                                isFilled
                                  ? "bg-slate-800 border-slate-600 hover:border-emerald-500/50 cursor-grab active:cursor-grabbing"
                                  : "bg-slate-900 border-slate-700/50 border-dashed"
                              }`}
                            >
                              <div className="w-6 h-6 flex items-center justify-center bg-slate-900 rounded font-bold text-slate-500 text-xs shrink-0">
                                {slotNum}
                              </div>
                              {isFilled ? (
                                <>
                                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                    <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${teamVal.toLowerCase()}.png`} alt={teamLabel} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-1 flex flex-row justify-between items-center pr-1 sm:pr-2 gap-2 min-w-0">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate mr-1">{teamLabel}</span>
                                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 bg-slate-900/80 rounded-md p-1 border border-slate-700/50 shrink-0" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                                      <span className="text-[11px] sm:text-[10px] text-slate-400 font-mono px-1 whitespace-nowrap font-bold">{NFL_WIN_TOTALS[teamVal] || 8.5}</span>
                                      <div className="flex gap-1 shrink-0">
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(`ou_${teamVal.toLowerCase()}`, 'OVER'); }}
                                          className={`px-3 sm:px-2 py-1 sm:py-0.5 rounded text-[10px] sm:text-[10px] font-bold transition-colors ${selections[`ou_${teamVal.toLowerCase()}`] === 'OVER' ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                        >O</button>
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleSelectOption(`ou_${teamVal.toLowerCase()}`, 'UNDER'); }}
                                          className={`px-3 sm:px-2 py-1 sm:py-0.5 rounded text-[10px] sm:text-[10px] font-bold transition-colors ${selections[`ou_${teamVal.toLowerCase()}`] === 'UNDER' ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                        >U</button>
                                      </div>
                                    </div>
                                  </div>
                                  <GripVertical className="w-5 h-5 text-slate-600 shrink-0 hidden sm:block" />
                                  <div className="flex flex-col gap-0 sm:hidden shrink-0 border-l border-slate-700 pl-1">
                                     <button type="button" onClick={(e) => { e.stopPropagation(); handleMove(q.id, index, 'up'); }} disabled={index === 0} className="p-1 text-slate-400 disabled:opacity-20 active:bg-slate-800 rounded"><ChevronUp className="w-5 h-5" /></button>
                                     <button type="button" onClick={(e) => { e.stopPropagation(); handleMove(q.id, index, 'down'); }} disabled={index === 3} className="p-1 text-slate-400 disabled:opacity-20 active:bg-slate-800 rounded"><ChevronDown className="w-5 h-5" /></button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex-1 flex justify-between items-center text-slate-600 text-sm italic">
                                  Select a team for {slotNum}{slotNum === 1 ? 'st' : slotNum === 2 ? 'nd' : slotNum === 3 ? 'rd' : 'th'} place below
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Unassigned Teams */}
                      {!isFullyFilled && (
                        <div className="mt-6 border-t border-slate-700/50 pt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Teams</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt) => {
                              if (currentOrder.includes(opt.value)) return null;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => {
                                    const nextEmptyIndex = currentOrder.findIndex((val) => val === "");
                                    if (nextEmptyIndex !== -1) {
                                      const newOrder = [...currentOrder];
                                      newOrder[nextEmptyIndex] = opt.value;
                                      handleSelectOption(q.id, newOrder.join(","));
                                    }
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                                >
                                  <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${opt.value.toLowerCase()}.png`} alt={opt.label} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                  <span className="text-sm font-semibold text-slate-300">{opt.label}</span><span className="text-[10px] text-slate-500 font-mono ml-1">({NFL_WIN_TOTALS[opt.value] || 8.5})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {isFullyFilled && (
                         <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => {
                                 handleSelectOption(q.id, q.options.map(o => "").join(","));
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                            >
                              Reset Order
                            </button>
                         </div>
                      )}
                    </div>
                 </div>
               )
            })}
          </div>
        )}

        {/* PLAYOFFS STEP */}
        {currentStep.id === 'playoffs' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-white mb-1">Championship Bracket</h2>
              <p className="text-slate-400 text-sm">Pick the conference champions and the Super Bowl winner.</p>
            </div>

            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center">
               
               {/* Conference Level */}
               <div className="flex flex-row w-full justify-between sm:justify-around items-start gap-2 sm:gap-8 relative z-10">
                  {/* AFC */}
                  <div className="flex flex-col items-center w-full max-w-xs space-y-2">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/American_Football_Conference_logo.svg" alt="AFC" className="w-12 h-12 mb-1 drop-shadow-md" referrerPolicy="no-referrer" />
                     <span className="text-[10px] text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-full font-mono mb-2">+{getPoints('afc_champ', 15)} PTS</span>
                     
                     <div className="w-full bg-slate-800 rounded-xl border border-rose-500/30 p-2 shadow-lg shadow-rose-900/20">
                        <select
                          value={selections['afc_champ'] || ""}
                          onChange={(e) => handleSelectOption('afc_champ', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition-colors font-bold cursor-pointer text-center appearance-none"
                        >
                          <option value="" disabled className="text-slate-600">-- AFC Champ --</option>
                          {AFC_TEAMS.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-white bg-slate-900">{opt.label}</option>
                          ))}
                        </select>
                     </div>
                     <div className="h-16 flex items-center justify-center mt-1">
                       {selections['afc_champ'] ? (
                           <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${selections['afc_champ'].toLowerCase()}.png`} alt="AFC" className="w-16 h-16 object-contain drop-shadow-xl animate-in zoom-in duration-300" referrerPolicy="no-referrer" />
                       ) : (
                           <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] text-center p-1">AFC Winner</div>
                       )}
                     </div>
                  </div>

                  {/* VS connector (desktop) */}
                  <div className="flex flex-col items-center justify-center h-full pt-12">
                     <div className="text-slate-600 font-extrabold text-xl italic px-4">VS</div>
                  </div>

                  {/* NFC */}
                  <div className="flex flex-col items-center w-full max-w-xs space-y-2">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/National_Football_Conference_logo.svg" alt="NFC" className="w-12 h-12 mb-1 drop-shadow-md" referrerPolicy="no-referrer" />
                     <span className="text-[10px] text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono mb-2">+{getPoints('nfc_champ', 15)} PTS</span>
                     
                     <div className="w-full bg-slate-800 rounded-xl border border-indigo-500/30 p-2 shadow-lg shadow-indigo-900/20">
                        <select
                          value={selections['nfc_champ'] || ""}
                          onChange={(e) => handleSelectOption('nfc_champ', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer text-center appearance-none"
                        >
                          <option value="" disabled className="text-slate-600">-- NFC Champ --</option>
                          {NFC_TEAMS.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-white bg-slate-900">{opt.label}</option>
                          ))}
                        </select>
                     </div>
                     <div className="h-16 flex items-center justify-center mt-1">
                       {selections['nfc_champ'] ? (
                           <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${selections['nfc_champ'].toLowerCase()}.png`} alt="NFC" className="w-16 h-16 object-contain drop-shadow-xl animate-in zoom-in duration-300" referrerPolicy="no-referrer" />
                       ) : (
                           <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] text-center p-1">NFC Winner</div>
                       )}
                     </div>
                  </div>
               </div>

               {/* Connector Path Downwards */}
               <div className="hidden md:block w-px h-8 bg-gradient-to-b from-slate-700 to-amber-500/50 my-2"></div>
               {/* <div className="md:hidden w-full h-px bg-slate-700 my-4 relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-slate-900 px-3 text-slate-500 text-xs font-bold uppercase tracking-widest">VS</span></div> */}

               {/* Super Bowl Level */}
               <div className="w-full max-w-sm mt-2 relative z-10 flex flex-col items-center space-y-2">
                   <div className="flex flex-col items-center mb-2">
                      <img src="https://upload.wikimedia.org/wikipedia/en/e/ed/Super_Bowl_LXI_Logo.svg" alt="Super Bowl LXI" className="w-24 h-auto drop-shadow-2xl mb-2" referrerPolicy="no-referrer" />
                      <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono font-bold mt-2">+{getPoints('super_bowl', 25)} PTS</span>
                   </div>
                   
                   <div className="w-full bg-slate-800 rounded-xl border-2 border-amber-500/50 p-2 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]">
                      <select
                        value={selections['super_bowl'] || ""}
                        onChange={(e) => handleSelectOption('super_bowl', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-1 sm:px-3 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-amber-500 transition-colors font-extrabold cursor-pointer text-center appearance-none"
                      >
                        <option value="" disabled className="text-slate-600">-- Select Champion --</option>
                        {selections['afc_champ'] && (
                           <option value={selections['afc_champ']} className="font-bold text-rose-300">
                             {AFC_TEAMS.find(t => t.value === selections['afc_champ'])?.label} (AFC)
                           </option>
                        )}
                        {selections['nfc_champ'] && (
                           <option value={selections['nfc_champ']} className="font-bold text-indigo-300">
                             {NFC_TEAMS.find(t => t.value === selections['nfc_champ'])?.label} (NFC)
                           </option>
                        )}
                        {/* Fallback to all if neither is selected yet */}
                        {!selections['afc_champ'] && !selections['nfc_champ'] && NFL_TEAMS_ALL.map(opt => (
                           <option key={opt.value} value={opt.value} className="text-white bg-slate-900">{opt.label}</option>
                        ))}
                      </select>
                   </div>
                   <div className="h-20 flex items-center justify-center mt-2">
                     {selections['super_bowl'] ? (
                         <div className="animate-in zoom-in duration-300 relative">
                           <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
                           <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${selections['super_bowl'].toLowerCase()}.png`} alt="SB Winner" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-10" referrerPolicy="no-referrer" />
                         </div>
                     ) : (
                         <div className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-dashed border-amber-500/30 flex items-center justify-center text-amber-500/50 text-[10px] text-center p-2">SB LXI Winner</div>
                     )}
                   </div>
               </div>
            </div>
          </div>
        )}

        {/* AWARDS STEP */}
        {currentStep.id === 'awards' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-white mb-2">Major Awards</h2>
              <p className="text-slate-400 text-sm">Predict who takes home the hardware this season.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awardsQuestions.map((q) => {
                const currentSelection = selections[q.id];
                return (
                  <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-white text-sm line-clamp-2">{q.title}</h3>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        +{getPoints(q.id, q.points)} PTS
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-4 flex-grow">{q.subtitle}</p>
                    
                    <div>
                      <select
                        value={currentSelection || ""}
                        onChange={(e) => handleSelectOption(q.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-600">-- Select Player --</option>
                        {q.options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="text-white bg-slate-900">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {currentSelection && (
                      <div className="mt-3 flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">
                        <Check className="w-4 h-4" /> Locked: {q.options.find((o) => o.value === currentSelection)?.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WIN TOTALS STEP */}
        {currentStep.id === 'ou' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-white mb-2">Win Totals (Over / Under)</h2>
              <p className="text-slate-400 text-sm">Predict whether each team goes over or under their projected wins.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {ouQuestions.map((q) => {
                 const currentSelection = selections[q.id];
                 const teamKey = q.id.replace('ou_', '');
                 const teamName = q.title.split(' - ')[0];
                 const line = q.title.split(' - ')[1];
                 
                 return (
                   <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                     <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${teamKey}.png`} alt={teamName} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                     <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{teamName}</div>
                        <div className="text-xs text-slate-400">{line}</div>
                     </div>
                     <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleSelectOption(q.id, 'OVER')}
                          className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${currentSelection === 'OVER' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                          Over
                        </button>
                        <button
                          onClick={() => handleSelectOption(q.id, 'UNDER')}
                          className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${currentSelection === 'UNDER' ? 'bg-rose-500 text-white' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                          Under
                        </button>
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>
        )}

        {/* SUBMIT STEP */}
        {currentStep.id === 'submit' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
                <Check className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Ready to Lock In?</h2>
              <p className="text-slate-400">Review your completion status and submit your picks.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-xl">
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                 <div>
                   <h3 className="text-lg font-bold text-white">Completion Status</h3>
                   <p className="text-xs text-slate-400">{answeredCount} of {totalQuestions} predictions made</p>
                 </div>
                 <div className="text-2xl font-mono font-extrabold text-teal-400">
                   {Math.round((answeredCount / totalQuestions) * 100)}%
                 </div>
               </div>

               {/* Tiebreaker Section */}
               <div className="mt-6 mb-8">
                 <h2 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-2 mb-2 uppercase">
                   Tiebreaker
                 </h2>
                 <p className="text-xs text-slate-400 mb-3">
                   In the event of a tie, what will be the total combined points scored in the Super Bowl? (Closest without going over wins the tiebreaker).
                 </p>
                 <div>
                   <input
                     type="number"
                     min="0"
                     value={tiebreaker}
                     onChange={(e) => setTiebreaker(e.target.value)}
                     placeholder="e.g. 52"
                     className="w-full sm:w-1/2 bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-teal-500 transition-colors"
                   />
                 </div>
               </div>

               {message && (
                 <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                   {message.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
                   {message.text}
                 </div>
               )}

               <button
                 onClick={handleSave}
                 disabled={saving || answeredCount === 0 || !tiebreaker}
                 className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-xl shadow-lg disabled:opacity-50 transition-all cursor-pointer text-lg"
               >
                 <Save className="w-5 h-5" />
                 {saving ? "Locking in..." : "Lock In My Picks"}
               </button>
               {(!tiebreaker) && (
                 <p className="text-rose-400 text-xs text-center mt-3 font-semibold">Please enter a tiebreaker score to submit.</p>
               )}
            </div>
          </div>
        )}
      </div>

      
      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center sticky bottom-0 bg-[#09222c] pb-2 z-20">
        <div className="absolute -top-6 right-2 flex items-center gap-1.5 text-xs">
          {autosaving ? (
            <span className="text-slate-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : lastAutosaveTime ? (
            <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>
          ) : null}
        </div>

        <button
          onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        {currentStepIndex < WIZARD_STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStepIndex(prev => Math.min(WIZARD_STEPS.length - 1, prev + 1))}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-teal-500/20"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : null}
      </div>

    </div>
  );
}
