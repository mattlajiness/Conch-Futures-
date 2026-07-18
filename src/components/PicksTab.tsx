import React, { useState, useEffect } from "react";
import { FUTURES_QUESTIONS } from "../constants";
import { Save, Check, Award, Compass, ShieldAlert, Zap, ListOrdered } from "lucide-react";
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
    const newPicks: Picks = {
      userId: user.uid,
      userDisplayName: user.displayName || "Player",
      userPhotoURL: user.photoURL || "",
      selections,
      updatedAt: new Date(),
    };

    try {
      await setDoc(doc(db, path), {
        userId: user.uid,
        userDisplayName: user.displayName || "Player",
        userPhotoURL: user.photoURL || "",
        selections,
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
  const divisionQuestions = activeQuestionsList.filter((q) => q.category === "division");
  const ouQuestions = activeQuestionsList.filter((q) => q.category === "over_under");
  const standingsQuestions = activeQuestionsList.filter((q) => q.category === "standings");

  // Helper functions for Division Standings predictions
  const getStandingOrder = (qId: string): string[] => {
    const value = selections[qId] || "";
    const parts = value.split(",");
    return [parts[0] || "", parts[1] || "", parts[2] || "", parts[3] || ""];
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
    <div className="space-y-8">
      {/* Information Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
          <ListOrdered className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-300">Live Scoring Active</h3>
          <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
            Your picks will be automatically graded and updated on the leaderboard using real-time NFL standings as the season progresses. Admin results are only required for manual overrides and official end-of-season awards.
          </p>
        </div>
      </div>

      {/* Save Action / Status Floating or Top bar */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg sticky top-4 z-20">
        <div className="w-full sm:w-auto">
          <div className="flex justify-between sm:justify-start items-center gap-4">
            <span className="text-white text-sm font-bold flex items-center gap-2">
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {message && (
            <span
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${
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
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {saving ? "Locking in..." : "Lock In Picks"}
          </button>
        </div>
      </div>

      {/* 1. SECTION: CHAMPIONSHIPS & AWARD FUTURES */}
      {(categoryFilter === "all" || categoryFilter === "award") && (
      <div>
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3 mb-6">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Award className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
            NFL Championships & Major Awards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awardsQuestions.map((q) => {
            const currentSelection = selections[q.id];
            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white text-base">{q.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      +{q.points} PTS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-normal">{q.subtitle}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Your Selection
                  </label>
                  <select
                    value={currentSelection || ""}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium cursor-pointer"
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

                {currentSelection && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold">
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

      {/* 2. SECTION: DIVISION CHAMPIONS */}
      {(categoryFilter === "all" || categoryFilter === "division") && (
      <div>
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3 mb-6 mt-10">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Compass className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
            NFL Division Winners
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {divisionQuestions.map((q) => {
            const currentSelection = selections[q.id];
            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-xs tracking-tight">{q.title}</h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +10P
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-snug mb-3">Choose the winner</p>
                </div>

                <div className="space-y-2 mt-auto">
                  <select
                    value={currentSelection || ""}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-600">
                      -- Choose Team --
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
            );
          })}
        </div>
      </div>
      )}

      {/* 4. SECTION: DIVISION STANDINGS ORDER */}
      {(categoryFilter === "all" || categoryFilter === "standings") && standingsQuestions.length > 0 && (
      <div>
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3 mb-6 mt-10">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
            NFL Division Standings Predictor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standingsQuestions.map((q) => {
            const currentOrder = getStandingOrder(q.id);
            const isFullyFilled = currentOrder.every((t) => t !== "");

            return (
              <div
                key={q.id}
                className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white text-base">{q.title}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      +{q.points} PTS
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

                <div className="space-y-3">
                  {[
                    { label: "1st Place (Winner)", color: "text-amber-400" },
                    { label: "2nd Place", color: "text-slate-300" },
                    { label: "3rd Place", color: "text-slate-400" },
                    { label: "4th Place (Last)", color: "text-orange-500" },
                  ].map((slot, index) => {
                    const selectedValue = currentOrder[index];
                    return (
                      <div key={index} className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className={`w-32 text-[10px] font-extrabold uppercase tracking-wider ${slot.color}`}>
                          {slot.label}
                        </span>
                        <select
                          value={selectedValue}
                          onChange={(e) => handleSelectStandingSlot(q.id, index, e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                        >
                          <option value="">-- Select Team --</option>
                          {q.options.map((opt) => {
                            const isSelectedElsewhere = currentOrder.some((t, i) => i !== index && t === opt.value);
                            const standing = nflStandings?.[opt.value];
                            const label = standing ? `${opt.label} (${standing.overallRecord})` : opt.label;
                            return (
                              <option key={opt.value} value={opt.value}>
                                {label} {isSelectedElsewhere ? "(Swaps)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {isFullyFilled ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">
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

      {/* 3. SECTION: OVER / UNDER WIN TOTALS */}
      {(categoryFilter === "all" || categoryFilter === "over_under") && (
      <div>
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3 mb-6 mt-10">
          <span className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </span>
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
            Win Total Over/Unders
          </h2>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:border-b border-slate-700/50 last:border-0 [&>*:not(:last-child)]:border-b md:[&>*:not(:last-child)]:border-b-0 md:[&>*:not(:nth-child(3n))]:border-r">
            {ouQuestions.map((q) => {
              const currentSelection = selections[q.id];
              const teamCode = q.id.replace("ou_", "").toUpperCase();
              const teamStanding = nflStandings?.[teamCode];
              const line = q.title.split("-")[1]?.trim().split(" ")[0] || "8.5";
              const teamName = q.title.split("-")[0]?.trim() || q.title;
              return (
                <div
                  key={q.id}
                  className="p-3 hover:bg-slate-800/40 transition-colors flex justify-between items-center gap-3"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-xs">{teamName}</h3>
                      {teamStanding && (
                        <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                          {teamStanding.overallRecord}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Line: <span className="font-semibold text-slate-300">{line} Wins</span>
                    </span>
                  </div>
                  <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 shrink-0">
                    {q.options.map((opt) => {
                      const isSelected = currentSelection === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelectOption(q.id, opt.value)}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

{/* Sticky footer Save helper */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
        <p>Make sure to press &quot;Lock In Picks&quot; above to submit or update your answers securely.</p>
        <button
          onClick={handleSave}
          disabled={saving || answeredCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold disabled:opacity-50 transition-colors cursor-pointer text-center"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
