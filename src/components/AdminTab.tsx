import React, { useState, useEffect } from "react";
import { FUTURES_QUESTIONS, NFL_WIN_TOTALS } from "../constants";
import { TeamStandingInfo } from "../lib/nflApi";
import {
  Save,
  Check,
  ShieldAlert,
  Award,
  Compass,
  Sparkles,
  ListOrdered,
  Settings,
  ClipboardList,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { Pool } from "../types";

interface AdminTabProps {
  pool: Pool;
  onPoolUpdated: (updatedPool: Pool) => void;
  categoryFilter?: string;
  nflStandings?: Record<string, TeamStandingInfo>;
}

export default function AdminTab({ pool, onPoolUpdated, categoryFilter = "all", nflStandings }: AdminTabProps) {
  const [activeTab, setActiveTab] = useState<"grades" | "config">("grades");
  
  // Grading state
  const [results, setResults] = useState<Record<string, string>>({});
  const [savingResults, setSavingResults] = useState(false);
  
  // Configuration state
  const [activeQuestions, setActiveQuestions] = useState<string[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);
  
  // Notification status
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (pool.results) {
      setResults(pool.results);
    } else {
      setResults({});
    }

    if (pool.activeQuestions) {
      setActiveQuestions(pool.activeQuestions);
    } else {
      // Default to all questions if none exist
      setActiveQuestions(FUTURES_QUESTIONS.map(q => q.id));
    }
  }, [pool]);

  // GRADING HELPERS
  const handleAutoSyncNFL = () => {
    if (!nflStandings) {
      setMessage({ type: "error", text: "No live NFL standings data available. Make sure you are connected to the internet." });
      return;
    }

    const updatedResults = { ...results };
    let syncedCount = 0;

    FUTURES_QUESTIONS.forEach((q) => {
      // 1. Division Winners
      if (q.category === "division") {
        const divisionTeams = q.options.map(o => o.value);
        const winner = divisionTeams.find(code => nflStandings[code]?.divisionStanding === 1);
        if (winner) {
          updatedResults[q.id] = winner;
          syncedCount++;
        }
      }

      // 2. Over/Unders
      if (q.category === "over_under") {
        const teamCode = q.id.replace("ou_", "").toUpperCase();
        const threshold = NFL_WIN_TOTALS[teamCode];
        const standing = nflStandings[teamCode];
        if (threshold !== undefined && standing) {
          const wins = standing.wins;
          const remainingGames = 17 - standing.wins - standing.losses - standing.ties;
          if (wins > threshold) {
            updatedResults[q.id] = "OVER";
            syncedCount++;
          } else if (wins + remainingGames < threshold) {
            updatedResults[q.id] = "UNDER";
            syncedCount++;
          }
        }
      }

      // 3. Division Standings
      if (q.category === "standings") {
        const divisionTeams = q.options.map(o => o.value);
        const hasAllStandings = divisionTeams.every(code => nflStandings[code]?.divisionStanding !== undefined);
        if (hasAllStandings) {
          const sorted = [...divisionTeams].sort((a, b) => {
            const standingA = nflStandings[a]?.divisionStanding ?? 99;
            const standingB = nflStandings[b]?.divisionStanding ?? 99;
            return standingA - standingB;
          });
          updatedResults[q.id] = sorted.join(",");
          syncedCount++;
        }
      }
    });

    setResults(updatedResults);
    setMessage({
      type: "success",
      text: `Successfully calculated ${syncedCount} outcomes using current live NFL standings! Review the selections below and click 'Save Official Results' to publish.`
    });
  };

  const handleSelectWinner = (questionId: string, value: string) => {
    setResults((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleClearWinner = (questionId: string) => {
    setResults((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  // DIVISION STANDINGS SWAPPING FOR GRADER
  const getStandingOrder = (questionId: string): string[] => {
    const val = results[questionId];
    if (!val) return ["", "", "", ""];
    const parts = val.split(",");
    while (parts.length < 4) parts.push("");
    return parts;
  };

  const handleSelectStandingSlot = (questionId: string, slotIndex: number, value: string) => {
    const currentOrder = getStandingOrder(questionId);
    const prevValue = currentOrder[slotIndex];

    const duplicateIndex = currentOrder.indexOf(value);
    if (duplicateIndex !== -1 && value !== "") {
      currentOrder[duplicateIndex] = prevValue;
    }
    currentOrder[slotIndex] = value;

    setResults((prev) => ({
      ...prev,
      [questionId]: currentOrder.join(","),
    }));
  };

  const handleSaveResults = async () => {
    setSavingResults(true);
    setMessage(null);

    const path = `pools/${pool.id}`;
    try {
      await updateDoc(doc(db, path), {
        results,
      });

      const updatedPool: Pool = {
        ...pool,
        results,
      };
      onPoolUpdated(updatedPool);
      
      setMessage({ type: "success", text: "Official results updated! Leaderboard scores recalculated in real-time." });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update results. Please try again." });
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSavingResults(false);
    }
  };

  // CONFIGURATION HELPERS
  const handleToggleQuestion = (questionId: string) => {
    setActiveQuestions((prev) => {
      if (prev.includes(questionId)) {
        // Prevent disabling all questions
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryIds = FUTURES_QUESTIONS.filter(q => q.category === category).map(q => q.id);
    setActiveQuestions((prev) => {
      const nonCategory = prev.filter(id => !categoryIds.includes(id));
      return [...nonCategory, ...categoryIds];
    });
  };

  const handleClearCategory = (category: string) => {
    const categoryIds = FUTURES_QUESTIONS.filter(q => q.category === category).map(q => q.id);
    setActiveQuestions((prev) => {
      const updated = prev.filter(id => !categoryIds.includes(id));
      // Fallback if empty to keep at least one question active globally
      if (updated.length === 0) return [FUTURES_QUESTIONS[0].id];
      return updated;
    });
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setMessage(null);

    const path = `pools/${pool.id}`;
    try {
      await updateDoc(doc(db, path), {
        activeQuestions,
      });

      const updatedPool: Pool = {
        ...pool,
        activeQuestions,
      };
      onPoolUpdated(updatedPool);

      setMessage({ type: "success", text: "Pool question configuration locked in successfully!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update question config." });
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSavingConfig(false);
    }
  };

  // Group questions
  const awardsQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "award");
  const divisionQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "division");
  const ouQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "over_under");
  const standingsQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "standings");

  // Determine active list for current viewing
  const activeQuestionsList = FUTURES_QUESTIONS.filter(
    (q) => !pool.activeQuestions || pool.activeQuestions.includes(q.id)
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-700/60 pb-px mb-4">
        <button
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "grades"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Grade Results
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "config"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" /> Configure Pool Futures ({activeQuestions.length})
        </button>
      </div>

      {/* Banner message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-[10px] underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === "config" ? (
        // CONFIGURATION PANEL
        <div className="space-y-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pick Your Pool&apos;s Active Futures
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-normal">
              Tailor your pool to your group! Check or uncheck categories below to choose exactly which questions will be active. Unchecked questions will be hidden from everyone and excluded from points/calculations.
            </p>
          </div>

          {/* Sticky header controls for Config */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 flex justify-between items-center gap-4 sticky top-4 z-20 shadow-md">
            <div>
              <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Active Futures Pool Setup</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Toggle categories to restrict or expand active questions.</p>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> {savingConfig ? "Saving..." : "Save Active Config"}
            </button>
          </div>

          {/* Group 1: Awards */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Major Awards
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAllCategory("award")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Select All Awards
                </button>
                <button
                  onClick={() => handleClearCategory("award")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Clear All Awards
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awardsQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    {isActive ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Division Champions */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> Division Champions (Winner Only)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAllCategory("division")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Select All Divisions
                </button>
                <button
                  onClick={() => handleClearCategory("division")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {divisionQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    {isActive ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: Over/Unders */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" /> Over / Under Win Totals
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAllCategory("over_under")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Select All O/U
                </button>
                <button
                  onClick={() => handleClearCategory("over_under")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ouQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    {isActive ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 4: Division Standings */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-400" /> NFL Division Standings (1st to 4th Place Predictor)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAllCategory("standings")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Select All Standings
                </button>
                <button
                  onClick={() => handleClearCategory("standings")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standingsQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    {isActive ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // GRADING PANEL
        <div className="space-y-8">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Enter Official Regular Season Outcomes
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-normal">
              Declare official final winners and division standings! As soon as you hit save, grades are recalculated instantly for all members. Leave categories empty until they are officially decided.
            </p>
          </div>

          {/* Sticky grading controls */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-20 shadow-md">
            <div className="flex-grow">
              <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Unsaved Grades & Outcomes</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Grade predictions manually below, or auto-calculate outcomes from live NFL standings.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto items-stretch sm:items-center">
              {nflStandings && (
                <button
                  type="button"
                  onClick={handleAutoSyncNFL}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600/15 hover:bg-teal-600/25 border border-teal-500/30 text-teal-400 rounded-lg text-xs font-extrabold transition-all cursor-pointer justify-center"
                  title="Auto-fill results from ESPN live standing records"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Auto-grade with NFL Data
                </button>
              )}
              
              <button
                onClick={handleSaveResults}
                disabled={savingResults}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs disabled:opacity-50 transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-md shadow-amber-500/10"
              >
                <Save className="w-4 h-4" /> {savingResults ? "Saving..." : "Save Official Results"}
              </button>
            </div>
          </div>

          {/* Categories for grading */}
          
          {/* Awards category */}
          {(categoryFilter === "all" || categoryFilter === "award") && awardsQuestions.some(q => activeQuestions.includes(q.id)) && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2 pb-1 border-b border-slate-800">
                <Award className="w-4 h-4" /> Major Award Winners
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {awardsQuestions.filter(q => activeQuestions.includes(q.id)).map((q) => {
                  const currentWinner = results[q.id];
                  return (
                    <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{q.title}</h4>
                        <p className="text-slate-400 text-[10px] mt-0.5">{q.subtitle}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <select
                          value={currentWinner || ""}
                          onChange={(e) => handleSelectWinner(q.id, e.target.value)}
                          className="flex-grow bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-semibold"
                        >
                          <option value="">-- No Winner Decided --</option>
                          {q.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {currentWinner && (
                          <button
                            onClick={() => handleClearWinner(q.id)}
                            className="p-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Division Champions Category */}
          {(categoryFilter === "all" || categoryFilter === "division") && divisionQuestions.some(q => activeQuestions.includes(q.id)) && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2 pb-1 border-b border-slate-800">
                <Compass className="w-4 h-4" /> Division Champions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {divisionQuestions.filter(q => activeQuestions.includes(q.id)).map((q) => {
                  const currentWinner = results[q.id];
                  return (
                    <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between gap-3">
                      <h4 className="font-bold text-white text-xs leading-tight">{q.title}</h4>
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={currentWinner || ""}
                          onChange={(e) => handleSelectWinner(q.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-semibold"
                        >
                          <option value="">-- Winner --</option>
                          {q.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {currentWinner && (
                          <button
                            onClick={() => handleClearWinner(q.id)}
                            className="text-[10px] text-rose-400 text-left hover:underline"
                          >
                            Clear Result
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Division Standings Category */}
          {(categoryFilter === "all" || categoryFilter === "standings") && standingsQuestions.some(q => activeQuestions.includes(q.id)) && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2 pb-1 border-b border-slate-800">
                <ListOrdered className="w-4 h-4" /> NFL Division Standings Grader
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {standingsQuestions.filter(q => activeQuestions.includes(q.id)).map((q) => {
                  const currentOrder = getStandingOrder(q.id);
                  const isFullyGraded = currentOrder.every((t) => t !== "");

                  return (
                    <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{q.title}</h4>
                          <p className="text-slate-400 text-[10px] mt-0.5">{q.subtitle}</p>
                        </div>
                        {results[q.id] && (
                          <button
                            onClick={() => handleClearWinner(q.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Clear standings
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { label: "1st Place Winner", color: "text-amber-400" },
                          { label: "2nd Place Finish", color: "text-slate-300" },
                          { label: "3rd Place Finish", color: "text-slate-400" },
                          { label: "4th Place Last", color: "text-orange-500" }
                        ].map((slot, index) => {
                          const value = currentOrder[index];
                          return (
                            <div key={index} className="flex items-center gap-3 bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                              <span className={`w-36 text-[10px] font-extrabold uppercase tracking-wide ${slot.color}`}>
                                {slot.label}
                              </span>
                              <select
                                value={value}
                                onChange={(e) => handleSelectStandingSlot(q.id, index, e.target.value)}
                                className="flex-grow bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                              >
                                <option value="">-- Choose team --</option>
                                {q.options.map((opt) => {
                                  const isSelectedElsewhere = currentOrder.some((t, i) => i !== index && t === opt.value);
                                  return (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label} {isSelectedElsewhere ? "(Swaps)" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        })}
                      </div>

                      {isFullyGraded ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" /> Official Result: {currentOrder.map(t => q.options.find(o => o.value === t)?.label.split(" ").pop() || t).join(" > ")}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic">
                          Provide 4 unique teams to save official division standings grades.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Over / Under Category */}
          {(categoryFilter === "all" || categoryFilter === "over_under") && ouQuestions.some(q => activeQuestions.includes(q.id)) && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2 pb-1 border-b border-slate-800">
                <ShieldAlert className="w-4 h-4" /> Over/Under Win Totals
              </h3>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:border-b border-slate-700/50 last:border-0 [&>*:not(:last-child)]:border-b md:[&>*:not(:last-child)]:border-b-0 md:[&>*:not(:nth-child(3n))]:border-r">
                {ouQuestions.filter(q => activeQuestions.includes(q.id)).map((q) => {
                  const currentWinner = results[q.id];
                  const line = q.title.split("-")[1]?.trim().split(" ")[0] || "8.5";
                  const teamName = q.title.split("-")[0]?.trim() || q.title;
                  return (
                    <div
                      key={q.id}
                      className="p-3 hover:bg-slate-800/40 transition-colors flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3"
                    >
                      <div className="flex flex-col">
                        <h4 className="font-bold text-white text-xs">{teamName}</h4>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Line: <span className="font-semibold text-slate-300">{line} Wins</span>
                        </span>
                      </div>
                      <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 shrink-0 self-start xl:self-auto">
                        <button
                          onClick={() => handleSelectWinner(q.id, "OVER")}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                            currentWinner === "OVER"
                              ? "bg-amber-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          OVER
                        </button>
                        <button
                          onClick={() => handleSelectWinner(q.id, "UNDER")}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                            currentWinner === "UNDER"
                              ? "bg-amber-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          UNDER
                        </button>
                        <button
                          onClick={() => handleClearWinner(q.id)}
                          disabled={!currentWinner}
                          className={`px-2 py-1.5 ml-1 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                            currentWinner ? "text-rose-400 hover:bg-rose-500/20" : "text-slate-600 cursor-default opacity-50"
                          }`}
                        >
                          CLR
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          )}

          {activeQuestionsList.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-800/20 border border-slate-800 rounded-xl">
              All questions have been disabled in pool settings. Switch to &quot;Configure Pool Futures&quot; above to activate them.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
