import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { FUTURES_QUESTIONS } from "../constants";
import { Pool, Picks } from "../types";
import { Users, PieChart, ShieldAlert, CheckCircle2, Award, RefreshCw } from "lucide-react";
import { TeamStandingInfo } from "../lib/nflApi";

interface ComparePicksTabProps {
  pool: Pool;
  categoryFilter?: string;
  nflStandings?: Record<string, TeamStandingInfo>;
}

export default function ComparePicksTab({ pool, categoryFilter = "all", nflStandings }: ComparePicksTabProps) {
  const [allPicks, setAllPicks] = useState<Picks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  const getPoints = (qId: string, defaultPoints: number) => {
    return pool.customPoints?.[qId] !== undefined ? pool.customPoints[qId] : defaultPoints;
  };

  const activeQuestionsList = FUTURES_QUESTIONS.filter(
    (q) => !pool.activeQuestions || pool.activeQuestions.includes(q.id)
  );

  const filteredQuestions = categoryFilter === "all"
    ? activeQuestionsList
    : activeQuestionsList.filter((q) => q.category === categoryFilter || (categoryFilter === "standings" && q.category === "over_under"));

  useEffect(() => {
    if (filteredQuestions.length > 0) {
      const isAvailable = filteredQuestions.some((q) => q.id === selectedQuestionId);
      if (!isAvailable) {
        setSelectedQuestionId(filteredQuestions[0].id);
      }
    } else {
      setSelectedQuestionId("");
    }
  }, [categoryFilter, filteredQuestions, selectedQuestionId]);

  const fetchPicks = async () => {
    setLoading(true);
    setError(null);
    try {
      const picksRef = collection(db, `pools/${pool.id}/picks`);
      const picksSnap = await getDocs(picksRef);
      const picksList: Picks[] = [];
      picksSnap.forEach((doc) => {
        picksList.push({ id: doc.id, ...doc.data() } as any);
      });
      setAllPicks(picksList);
    } catch (err) {
      console.error(err);
      setError("Failed to load pool predictions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks();
  }, [pool]);

  const selectedQuestion = activeQuestionsList.find((q) => q.id === selectedQuestionId) || filteredQuestions[0] || activeQuestionsList[0] || FUTURES_QUESTIONS[0];

  // Calculate statistics for the selected question
  const stats: Record<string, { count: number; percentage: number; users: string[] }> = {};
  let totalResponses = 0;

  if (selectedQuestion.category !== "standings") {
    selectedQuestion.options.forEach((opt) => {
      stats[opt.value] = { count: 0, percentage: 0, users: [] };
    });
  }

  allPicks.forEach((p) => {
    const pickValue = p.selections[selectedQuestion.id];
    if (pickValue) {
      totalResponses += 1;
      if (!stats[pickValue]) {
        // Handle custom field or unlisted value (like combined standings strings)
        stats[pickValue] = { count: 0, percentage: 0, users: [] };
      }
      stats[pickValue].count += 1;
      stats[pickValue].users.push(p.userDisplayName);
    }
  });

  // Calculate percentages
  Object.keys(stats).forEach((key) => {
    if (totalResponses > 0) {
      stats[key].percentage = Math.round((stats[key].count / totalResponses) * 100);
    }
  });

  // Sort stats by count descending
  const sortedStats = Object.entries(stats)
    .map(([value, info]) => {
      let optionLabel = value;
      if (selectedQuestion.category === "standings") {
        optionLabel = value.split(",").map(t => {
          const lbl = selectedQuestion.options.find(o => o.value === t)?.label.split(" ").pop() || t;
          const std = nflStandings?.[t];
          return std ? `${lbl} (${std.overallRecord})` : lbl;
        }).join(" > ");
      } else {
        const lbl = selectedQuestion.options.find((o) => o.value === value)?.label || value;
        const std = nflStandings?.[value];
        optionLabel = std ? `${lbl} (${std.overallRecord})` : lbl;
      }
      return { value, optionLabel, ...info };
    })
    .sort((a, b) => b.count - a.count);

  const officialWinner = pool.results?.[selectedQuestion.id];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
      {/* Question Selector list (Left 1 column) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-1 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> Choose Future
          </h2>
          <button
            onClick={fetchPicks}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            title="Refresh Picks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-1">
          {filteredQuestions.map((q) => {
            const isSelected = q.id === selectedQuestionId;
            const answersCount = allPicks.filter((p) => p.selections[q.id]).length;
            const isSettled = pool.results?.[q.id] != null;

            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionId(q.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/40 text-white font-bold"
                    : "bg-slate-800/60 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs truncate">{q.title}</span>
                  {isSettled && (
                    <span className="text-[8px] font-mono font-semibold px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                      Graded
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500 font-mono">
                  <span>+{getPoints(q.id, q.points)} PTS</span>
                  <span>{answersCount} predictions</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparisons and Breakdown (Right 2 columns) */}
      <div className="lg:col-span-2 space-y-2">
        {loading ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 text-center animate-pulse">
            Loading comparative insights...
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-rose-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header info of chosen question */}
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3 shadow-sm">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                {selectedQuestion.category.replace("_", " ")}
              </span>
              <h3 className="text-xl font-black text-white mt-2">{selectedQuestion.title}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{selectedQuestion.subtitle}</p>

              {officialWinner && (
                <div className="mt-4 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Official Outcome:{" "}
                    <span className="font-extrabold text-white">
                      {selectedQuestion.category === "standings"
                        ? officialWinner.split(",").map(t => selectedQuestion.options.find(o => o.value === t)?.label.split(" ").pop() || t).join(" > ")
                        : (selectedQuestion.options.find((o) => o.value === officialWinner)?.label || officialWinner)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Statistics Chart breakdown */}
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3 shadow-sm space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-1 border-b border-slate-700/50">
                <PieChart className="w-4 h-4 text-emerald-400" /> Consensus & Picks Breakdown
              </h4>

              {totalResponses === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">No one has picked this category yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {sortedStats.map((item) => {
                    if (item.count === 0) return null;
                    const isWinnerOption = officialWinner && item.value === officialWinner;

                    return (
                      <div key={item.value} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${isWinnerOption ? "text-emerald-400" : "text-slate-200"}`}>
                            {item.optionLabel} {isWinnerOption && "(Winner)"}
                          </span>
                          <span className="font-mono text-slate-400">
                            {item.count} player{item.count > 1 ? "s" : ""} ({item.percentage}%)
                          </span>
                        </div>

                        {/* Bar Gauge */}
                        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/30">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isWinnerOption ? "bg-emerald-500" : "bg-slate-500"
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>

                        {/* Users List inline tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.users.map((uname, index) => (
                            <span
                              key={index}
                              className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-700/40 px-2 py-0.5 rounded"
                            >
                              {uname}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Complete Grid List comparison */}
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3 shadow-sm space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-1 border-b border-slate-700/50">
                <Users className="w-4 h-4 text-emerald-400" /> Individual Predictions List
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allPicks.map((pick) => {
                  const userChoice = pick.selections[selectedQuestion.id];
                  
                  let label = "No pick";
                  if (userChoice) {
                    if (selectedQuestion.category === "standings") {
                      label = userChoice.split(",").map(t => selectedQuestion.options.find(o => o.value === t)?.label.split(" ").pop() || t).join(" > ");
                    } else {
                      label = selectedQuestion.options.find((o) => o.value === userChoice)?.label || userChoice;
                    }
                  }

                  let displayStatus = null;
                  if (userChoice) {
                    if (officialWinner) {
                      if (selectedQuestion.category === "standings") {
                        const userParts = userChoice.split(",");
                        const officialParts = officialWinner.split(",");
                        let matches = 0;
                        for (let i = 0; i < 4; i++) {
                          if (userParts[i] === officialParts[i]) matches += 1;
                        }
                        displayStatus = (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${matches === 4 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                            {matches}/4 Correct
                          </span>
                        );
                      } else {
                        const isCorrect = userChoice === officialWinner;
                        displayStatus = isCorrect ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            Correct
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                            Missed
                          </span>
                        );
                      }
                    } else {
                      displayStatus = (
                        <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                          Pending
                        </span>
                      );
                    }
                  } else {
                    displayStatus = <span className="text-[9px] font-mono text-slate-600 italic">Unsubmitted</span>;
                  }

                  return (
                    <div
                      key={pick.userId}
                      className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/20 flex justify-between items-center"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs font-bold text-slate-300 block truncate">{pick.userDisplayName}</span>
                        <span className={`text-[11px] font-semibold block ${userChoice ? "text-white" : "text-slate-600 italic"}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {displayStatus}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
