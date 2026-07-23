import React, { useState, useEffect } from "react";
import { FUTURES_QUESTIONS, NFL_TEAMS_ALL } from "../constants";
import { Save, Check, Award, Compass, ShieldAlert, Zap, ListOrdered, GripVertical, Trophy } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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

export default function PicksTab({ pool, user, userPicks, onPicksSaved, categoryFilter = "all", nflStandings }: PicksTabProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const getPoints = (qId: string, defaultPoints: number) => {
    return pool.customPoints?.[qId] !== undefined ? pool.customPoints[qId] : defaultPoints;
  };

  const [draggedItem, setDraggedItem] = useState<{ qId: string; index: number } | null>(null);

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
    
    // Remove dragged item and insert at target index
    const [removed] = newOrder.splice(draggedItem.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    handleSelectOption(qId, newOrder.join(","));
    setDraggedItem(null);
  };

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing picks if available
  useEffect(() => {
    if (userPicks?.selections) {
      setSelections(userPicks.selections);
    } else {
      setSelections({});
    }
  }, [userPicks]);

  const handleSelectOption = (questionId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

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
      updatedAt: new Date(),
    };

    try {
      await setDoc(doc(db, path), {
        userId: user.uid,
        userDisplayName: user.displayName || "Player",
        userPhotoURL: user.photoURL || "",
        selections: selectionsToSave,
        updatedAt: serverTimestamp(),
      });

      onPicksSaved(newPicks);
      setMessage({ type: "success", text: "Your predictions have been locked in!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save picks. Please try again." });
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  // Filter questions by active list configured in this pool
  const activeQuestionsList = FUTURES_QUESTIONS.filter(
    (q) => !pool.activeQuestions || pool.activeQuestions.includes(q.id)
  );

  // Group questions by category
  const awardsQuestions = activeQuestionsList.filter((q) => q.category === "award");
  const championshipQuestions = activeQuestionsList.filter((q) => q.category === "championship");
  const divisionQuestions = activeQuestionsList.filter((q) => q.category === "division");
  const ouQuestions = activeQuestionsList.filter((q) => q.category === "over_under");
  const standingsQuestions = activeQuestionsList.filter((q) => q.category === "standings");

  // Helper functions for Division Standings predictions
  const getStandingOrder = (qId: string): string[] => {
    const q = activeQuestionsList.find(q => q.id === qId);
    if (!q) return [];
    const value = selections[qId];
    if (value) {
      const parts = value.split(",");
      if (parts.length === q.options.length) return parts;
    }
    return q.options.map(o => o.value);
  };

  const handleSelectStandingSlot = (qId: string, slotIndex: number, teamValue: string) => {
    const currentOrder = getStandingOrder(qId);
    currentOrder[slotIndex] = teamValue;

    // Swap/clear team if already selected in another slot
    for (let i = 0; i < 4; i++) {
      if (i !== slotIndex && currentOrder[i] === teamValue) {
        currentOrder[i] = "";
      }
    }

    const joined = currentOrder.join(",");
    handleSelectOption(qId, joined);
  };

  const fillWithLiveStandings = (qId: string, options: Array<{ value: string; label: string }>) => {
    if (!nflStandings) return;
    const sortedOptions = [...options].sort((a, b) => {
      const standingA = nflStandings[a.value]?.divisionStanding ?? 99;
      const standingB = nflStandings[b.value]?.divisionStanding ?? 99;
      return standingA - standingB;
    });
    
    const joined = sortedOptions.map(opt => opt.value).join(",");
    handleSelectOption(qId, joined);
  };

  const totalQuestions = activeQuestionsList.length;
  const answeredCount = activeQuestionsList.filter((q) => {
    if (q.category === "standings") {
      const order = getStandingOrder(q.id);
      return order.every((t) => t !== "");
    }
    return !!selections[q.id];
  }).length;

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Information Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-start gap-2">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
          <ListOrdered className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-indigo-300">Live Scoring Active</h3>
          <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
            Your picks will be automatically graded and updated on the leaderboard using real-time NFL standings as the season progresses. Admin results are only required for manual overrides and official end-of-season awards.
          </p>
        </div>
      </div>

      {/* Save Action / Status Floating or Top bar */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 sm:p-2.5 flex flex-col sm:flex-row justify-between items-center gap-2.5 shadow-lg sticky top-2.5 z-20">
        <div className="w-full sm:w-auto">
          <div className="flex justify-between sm:justify-start items-center gap-2.5">
            <span className="text-white text-xs font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Progress: {answeredCount} / {totalQuestions} Picks Done
            </span>
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-700/50 px-2.5 py-1 rounded font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full sm:w-64 bg-slate-900 h-2 rounded-full overflow-hidden mt-2 border border-slate-700/30">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {message && (
            <span
              className={`text-xs px-2 py-1.5 rounded-lg font-medium border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {message.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || answeredCount === 0}
            className="flex items-center gap-2 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {saving ? "Locking in..." : "Lock In Picks"}
          </button>
        </div>
      </div>

      
      {(categoryFilter === "all" || categoryFilter === "standings") && standingsQuestions.length > 0 && (
      <div>
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-1 mb-2 mt-3">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            NFL Division Standings Predictor
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-2 -mt-3">
          Drag and drop to reorder. Correctly predict the <strong>exact order</strong> of all 4 teams in a division to receive a <strong>+10 point bonus</strong>!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {standingsQuestions.map((q) => {
            const currentOrder = getStandingOrder(q.id);
            const isFullyFilled = currentOrder.every((t) => t !== "");

            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-2.5 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white text-sm">{q.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      +{getPoints(q.id, q.points)} PTS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">{q.subtitle}</p>
                  
                  {nflStandings && (
                    <button
                      type="button"
                      onClick={() => fillWithLiveStandings(q.id, q.options)}
                      className="mt-2.5 flex items-center gap-1 px-2 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[9px] font-mono font-black rounded-md border border-teal-500/20 cursor-pointer transition-all uppercase"
                    >
                      <Zap className="w-2.5 h-2.5 animate-pulse text-amber-400 fill-amber-400" /> Use Current Standings
                    </button>
                  )}
                </div>

                <div className="space-y-2 relative">
                  {[
                    { label: "1st Place (Winner)", color: "text-amber-400", bgColor: "bg-amber-400/10", borderColor: "border-amber-500/20" },
                    { label: "2nd Place", color: "text-slate-300", bgColor: "bg-slate-800", borderColor: "border-slate-700" },
                    { label: "3rd Place", color: "text-slate-400", bgColor: "bg-slate-800/80", borderColor: "border-slate-700/80" },
                    { label: "4th Place (Last)", color: "text-orange-500", bgColor: "bg-orange-500/5", borderColor: "border-orange-500/10" },
                  ].map((slot, index) => {
                    const selectedValue = currentOrder[index];
                    const teamOption = q.options.find(o => o.value === selectedValue);
                    const isDragging = draggedItem?.qId === q.id && draggedItem?.index === index;
                    const ouQuestion = selectedValue ? ouQuestions.find(ouq => ouq.id === `ou_${selectedValue.toLowerCase()}`) : null;
                    const currentOuSelection = ouQuestion ? selections[ouQuestion.id] : undefined;
                    
                    return (
                      <div 
                        key={selectedValue || index} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, q.id, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, q.id, index)}
                        className={`flex flex-col gap-2 ${slot.bgColor} p-3 rounded-lg border ${slot.borderColor} transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 hover:border-emerald-500/50'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                          <div className="flex flex-col gap-0.5 w-full sm:w-32 shrink-0 pointer-events-none">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${slot.color}`}>
                              {slot.label}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-2 bg-slate-950/50 rounded-md py-1 px-2 border border-slate-700/50">
                             <div className="flex items-center gap-2 pointer-events-none">
                              {selectedValue && NFL_TEAMS_ALL.some(t => t.value === selectedValue) && (
                                <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${selectedValue.toLowerCase()}.png`} alt={selectedValue} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              )}
                              <span className="text-xs font-bold text-white">
                                {teamOption?.label || "-- Select Team --"}
                              </span>
                              {nflStandings?.[selectedValue] && (
                                <span className="text-xs font-mono text-slate-400 ml-1">
                                  ({nflStandings[selectedValue].overallRecord})
                                </span>
                              )}
                            </div>
                            <GripVertical className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
                          </div>
                        </div>
                        {ouQuestion && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-700/50 pt-2 mt-2 gap-2 sm:gap-0">
                            <div className="flex items-center justify-between sm:justify-start gap-2 sm:ml-[140px]">
                              <div className="text-xs text-slate-300 font-medium">
                                <span className="hidden sm:inline">Win Total: </span>
                                <span className="sm:hidden">Wins: </span>
                                <span className="font-bold text-white">{ouQuestion.title.split("-")[1]?.trim().split(" ")[0] || "8.5"}</span>
                              </div>
                              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                +{getPoints(ouQuestion.id, ouQuestion.points)} PTS
                              </span>
                            </div>
                            <div className="flex gap-2 justify-end">
                              {ouQuestion.options.map((opt) => {
                                const isSelected = currentOuSelection === opt.value;
                                return (
                                  <button
                                    type="button"
                                    key={opt.value}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectOption(ouQuestion.id, opt.value);
                                    }}
                                    className={`px-2.5 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                                      isSelected ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800"
                                    }`}
                                  >
                                    {opt.label.split(" ")[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isFullyFilled ? (
                  <div className="flex sm:items-center gap-1.5 px-2 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" /> Predicted finish: {currentOrder.map(t => q.options.find(o => o.value === t)?.label.split(" ").pop() || t).join(" > ")}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic pl-1">
                    Select a unique team for all 4 positions to complete this prediction.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* SECTION: CHAMPIONSHIPS */}
      {(categoryFilter === "all" || categoryFilter === "championship") && (
      <div>
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-1 mb-2">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            NFL Championships
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {championshipQuestions.map((q) => {
            const currentSelection = selections[q.id];
            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-2.5 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white text-sm">{q.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      +{getPoints(q.id, q.points)} PTS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">{q.subtitle}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Your Selection
                  </label>
                  
                  <div className="flex items-center gap-2">
                    {currentSelection && NFL_TEAMS_ALL.some(t => t.value === currentSelection) && (
                      <div className="shrink-0 bg-slate-900 rounded border border-slate-700/50 p-1 flex items-center justify-center">
                        <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${currentSelection.toLowerCase()}.png`} alt={currentSelection} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="flex-1">
                      <select
                    value={currentSelection || ""}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors font-medium cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-600">
                      -- Click to Predict --
                    </option>
                    {q.options.map((opt) => {
                      const standing = nflStandings?.[opt.value];
                      const label = standing ? `${opt.label} (${standing.overallRecord})` : opt.label;
                      return (
                        <option key={opt.value} value={opt.value} className="text-white bg-slate-900">
                          {label}
                        </option>
                      );
                    })}
                  </select>
                    </div>
                  </div>

                </div>

                {currentSelection && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900/60 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" /> Selected:{" "}
                    {q.options.find((o) => o.value === currentSelection)?.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      

{/* SECTION: PLAYER AWARDS */}
      {(categoryFilter === "all" || categoryFilter === "award") && (
      <div>
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-1 mb-2">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Award className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            NFL Major Awards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {awardsQuestions.map((q) => {
            const currentSelection = selections[q.id];
            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-2.5 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white text-sm">{q.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      +{getPoints(q.id, q.points)} PTS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">{q.subtitle}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Your Selection
                  </label>
                  
                  <div className="flex items-center gap-2">
                    {currentSelection && NFL_TEAMS_ALL.some(t => t.value === currentSelection) && (
                      <div className="shrink-0 bg-slate-900 rounded border border-slate-700/50 p-1 flex items-center justify-center">
                        <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${currentSelection.toLowerCase()}.png`} alt={currentSelection} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="flex-1">
                      <select
                    value={currentSelection || ""}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors font-medium cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-600">
                      -- Click to Predict --
                    </option>
                    {q.options.map((opt) => {
                      const standing = nflStandings?.[opt.value];
                      const label = standing ? `${opt.label} (${standing.overallRecord})` : opt.label;
                      return (
                        <option key={opt.value} value={opt.value} className="text-white bg-slate-900">
                          {label}
                        </option>
                      );
                    })}
                  </select>
                    </div>
                  </div>

                </div>

                {currentSelection && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900/60 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" /> Selected:{" "}
                    {q.options.find((o) => o.value === currentSelection)?.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      

{/* Sticky footer Save helper */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs">
        <p>Make sure to press &quot;Lock In Picks&quot; above to submit or update your answers securely.</p>
        <button
          onClick={handleSave}
          disabled={saving || answeredCount === 0}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold disabled:opacity-50 transition-colors cursor-pointer text-center"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
