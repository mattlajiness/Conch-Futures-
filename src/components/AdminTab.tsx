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
  RefreshCw,
  Trophy,
  CircleDollarSign,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Receipt,
  PieChart,
  RotateCcw,
  Shield
} from "lucide-react";
import { doc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { useAuth } from "../lib/auth";
import { Pool, PoolDuesPayment } from "../types";

interface AdminTabProps {
  pool: Pool;
  onPoolUpdated: (updatedPool: Pool) => void;
  categoryFilter?: string;
  nflStandings?: Record<string, TeamStandingInfo>;
  activeSubTab?: "grades" | "dues" | "config";
  onSubTabChange?: (tab: "grades" | "dues" | "config") => void;
}

export default function AdminTab({ pool, onPoolUpdated, categoryFilter = "all", nflStandings, activeSubTab, onSubTabChange }: AdminTabProps) {
  const { user } = useAuth();
  const [internalTab, setInternalTab] = useState<"grades" | "dues" | "config">("grades");
  
  const activeTab = activeSubTab || internalTab;
  const setActiveTab = onSubTabChange || setInternalTab;
  
  // Grading state
  const [results, setResults] = useState<Record<string, string>>({});
  const [tiebreakerResult, setTiebreakerResult] = useState<string>("");
  const [savingResults, setSavingResults] = useState(false);
  
  // Configuration state
  const [activeQuestions, setActiveQuestions] = useState<string[]>([]);
  const [customPoints, setCustomPoints] = useState<Record<string, number>>({});
  const [poolDeadline, setPoolDeadline] = useState<string>("");
  const [savingConfig, setSavingConfig] = useState(false);
  
  // Dues & Payments state
  const [entryFee, setEntryFee] = useState<number>(pool.entryFee || 0);
  const [duesNote, setDuesNote] = useState<string>(pool.duesNote || "");
  const [payments, setPayments] = useState<Record<string, PoolDuesPayment>>(pool.payments || {});
  const [savingDuesSettings, setSavingDuesSettings] = useState(false);
  const [savingDuesStatus, setSavingDuesStatus] = useState(false);
  
  // Members list for dues tracking
  const [members, setMembers] = useState<{ userId: string; userDisplayName: string; userPhotoURL?: string; pickCount: number }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [duesSearch, setDuesSearch] = useState("");
  const [duesFilter, setDuesFilter] = useState<"all" | "paid" | "unpaid">("all");
  
  // Notification status
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (pool.results) {
      setResults(pool.results);
      if (pool.tiebreakerResult) setTiebreakerResult(pool.tiebreakerResult);
    } else {
      setResults({});
    }

    if (pool.customPoints) {
      setCustomPoints(pool.customPoints);
    }
    
    if (pool.deadline) {
       const d = pool.deadline.toDate ? pool.deadline.toDate() : new Date(pool.deadline);
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const day = String(d.getDate()).padStart(2, '0');
       const hours = String(d.getHours()).padStart(2, '0');
       const mins = String(d.getMinutes()).padStart(2, '0');
       setPoolDeadline(`${year}-${month}-${day}T${hours}:${mins}`);
    } else {
       setPoolDeadline("2026-09-10T20:20");
    }

    if (pool.activeQuestions) {
      setActiveQuestions(pool.activeQuestions);
    } else {
      // Default to all questions if none exist
      setActiveQuestions(FUTURES_QUESTIONS.map(q => q.id));
    }
    if (pool.entryFee !== undefined) setEntryFee(pool.entryFee);
    if (pool.duesNote !== undefined) setDuesNote(pool.duesNote);
    if (pool.payments) setPayments(pool.payments);
  }, [pool]);

  // FETCH POOL MEMBERS
  const fetchPoolMembers = async () => {
    setLoadingMembers(true);
    try {
      const picksRef = collection(db, `pools/${pool.id}/picks`);
      const picksSnap = await getDocs(picksRef);
      const memberList: { userId: string; userDisplayName: string; userPhotoURL?: string; pickCount: number }[] = [];
      picksSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const isCurrentAuthUser = user && docSnap.id === user.uid;
        const photo = (isCurrentAuthUser && user.photoURL) ? user.photoURL : (data.userPhotoURL || "");
        const name = (isCurrentAuthUser && user.displayName) ? user.displayName : (data.userDisplayName || "Anonymous Player");
        const pickCount = data.selections ? Object.keys(data.selections).length : 0;
        memberList.push({
          userId: docSnap.id,
          userDisplayName: name,
          userPhotoURL: photo,
          pickCount,
        });
      });
      memberList.sort((a, b) => a.userDisplayName.localeCompare(b.userDisplayName));
      setMembers(memberList);
    } catch (err) {
      console.error("Failed to load pool members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dues") {
      fetchPoolMembers();
    }
  }, [activeTab, pool.id]);

  // DUES HANDLERS
  const handleTogglePayment = (userId: string) => {
    setPayments((prev) => {
      const current = prev[userId];
      const isCurrentlyPaid = current?.paid || false;
      return {
        ...prev,
        [userId]: {
          paid: !isCurrentlyPaid,
          paidAt: !isCurrentlyPaid ? new Date().toISOString() : undefined,
          amount: !isCurrentlyPaid ? (current?.amount || entryFee || 0) : 0,
          note: current?.note || "",
        },
      };
    });
  };

  const handleUpdatePaymentNote = (userId: string, note: string) => {
    setPayments((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { paid: false }),
        note,
      },
    }));
  };

  const handleMarkAll = (paid: boolean) => {
    setPayments((prev) => {
      const updated = { ...prev };
      members.forEach((m) => {
        updated[m.userId] = {
          paid,
          paidAt: paid ? new Date().toISOString() : undefined,
          amount: paid ? (entryFee || 0) : 0,
          note: prev[m.userId]?.note || "",
        };
      });
      return updated;
    });
  };

  const handleSaveDuesSettings = async () => {
    setSavingDuesSettings(true);
    setMessage(null);
    const path = `pools/${pool.id}`;
    try {
      const feeNum = Math.max(0, Number(entryFee) || 0);
      await updateDoc(doc(db, path), {
        entryFee: feeNum,
        duesNote: duesNote.trim(),
      });

      const updatedPool = {
        ...pool,
        entryFee: feeNum,
        duesNote: duesNote.trim(),
      };
      onPoolUpdated(updatedPool);
      setMessage({ type: "success", text: "League buy-in fee and payment instructions saved!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save buy-in settings. Please try again." });
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSavingDuesSettings(false);
    }
  };


  const handleToggleAdmin = async (userId: string, userName: string, isCurrentlyAdmin: boolean) => {
    setMessage(null);
    try {
      const newCoAdmins = [...(pool.coAdmins || [])];
      
      if (isCurrentlyAdmin) {
        
        const index = newCoAdmins.indexOf(userId);
        if (index > -1) newCoAdmins.splice(index, 1);
      } else {
        
        newCoAdmins.push(userId);
      }
      
      await updateDoc(doc(db, `pools/${pool.id}`), {
        coAdmins: newCoAdmins
      });
      
      onPoolUpdated({ ...pool, coAdmins: newCoAdmins });
      setMessage({ type: "success", text: `Successfully ${isCurrentlyAdmin ? 'removed' : 'added'} ${userName} as an admin.` });
      
      // Auto dismiss message
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update admins:", err);
      setMessage({ type: "error", text: "Failed to update admin permissions." });
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${userName} and all their picks from this pool?`)) return;
    
    setMessage(null);
    try {
      // Delete the picks document for this user in the current pool
      await deleteDoc(doc(db, `pools/${pool.id}/picks`, userId));
      
      // Update local members state immediately
      setMembers((prev) => prev.filter(m => m.userId !== userId));
      
      // Optionally clean up payment record if it exists
      if (payments[userId]) {
        const updatedPayments = { ...payments };
        delete updatedPayments[userId];
        setPayments(updatedPayments);
        await updateDoc(doc(db, `pools/${pool.id}`), {
          payments: updatedPayments
        });
      }
      
      setMessage({ type: "success", text: `Successfully removed ${userName} from the pool.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to remove member. They might have already been removed." });
    }
  };

  const handleSavePayments = async () => {
    setSavingDuesStatus(true);
    setMessage(null);
    const path = `pools/${pool.id}`;
    try {
      await updateDoc(doc(db, path), {
        payments,
      });

      const updatedPool = {
        ...pool,
        payments,
      };
      onPoolUpdated(updatedPool);
      setMessage({ type: "success", text: "League dues payment statuses saved successfully!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update dues payment statuses." });
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSavingDuesStatus(false);
    }
  };

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
        tiebreakerResult,
      });

      const updatedPool: Pool = {
        ...pool,
        results,
        tiebreakerResult,
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
  const handlePointsChange = (qId: string, points: number) => {
    setCustomPoints(prev => ({
      ...prev,
      [qId]: points
    }));
  };

  const getPoints = (q: { id: string, points: number }) => {
    return customPoints[q.id] !== undefined ? customPoints[q.id] : q.points;
  };

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
      const deadlineDate = poolDeadline ? new Date(poolDeadline) : new Date("2026-09-10T20:20:00-04:00");
      await updateDoc(doc(db, path), {
        activeQuestions,
        customPoints,
        deadline: deadlineDate,
      });

      const updatedPool: Pool = {
        ...pool,
        activeQuestions,
        customPoints,
        deadline: deadlineDate,
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
  const championshipQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "championship");
  const divisionQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "division");
  const ouQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "over_under");
  const standingsQuestions = FUTURES_QUESTIONS.filter((q) => q.category === "standings");

  // Determine active list for current viewing
  const activeQuestionsList = FUTURES_QUESTIONS.filter(
    (q) => !pool.activeQuestions || pool.activeQuestions.includes(q.id)
  );

  // Filter members for dues tracker
  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.userDisplayName.toLowerCase().includes(duesSearch.toLowerCase());
    const isPaid = payments[m.userId]?.paid || false;
    if (duesFilter === "paid") return matchesSearch && isPaid;
    if (duesFilter === "unpaid") return matchesSearch && !isPaid;
    return matchesSearch;
  });

  const totalMembersCount = members.length;
  const paidMembersCount = members.filter((m) => payments[m.userId]?.paid).length;
  const unpaidMembersCount = totalMembersCount - paidMembersCount;
  
  const totalCollectedAmount = members.reduce((sum, m) => {
    if (payments[m.userId]?.paid) {
      return sum + (payments[m.userId]?.amount ?? entryFee ?? 0);
    }
    return sum;
  }, 0);

  const totalExpectedAmount = totalMembersCount * (entryFee || 0);
  const outstandingAmount = Math.max(0, totalExpectedAmount - totalCollectedAmount);

  return (
    <div className="space-y-2">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-700/60 pb-px mb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "grades"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Grade Results
        </button>
        <button
          onClick={() => setActiveTab("dues")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "dues"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CircleDollarSign className="w-4 h-4 text-emerald-400" /> Manage Members
          {unpaidMembersCount > 0 && (entryFee || 0) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-mono">
              {unpaidMembersCount} Unpaid
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn ${
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

            {/* DUES TRACKER TAB */}
      {activeTab === "dues" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/20 rounded-2xl p-3.5">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" /> Manage Members & Pot Tracker
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-normal">
              Set your pool's buy-in entry fee and payment note, then easily track who has paid. You can also click the shield icon next to a member's name in the checklist below to promote them to Co-Admin.
            </p>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Entry Fee */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Entry Fee / Player</span>
                <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">
                  ${(entryFee || 0).toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Total Collected */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Total Collected</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
                  ${totalCollectedAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">
                  of ${totalExpectedAmount.toFixed(2)} expected
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            {/* Paid Ratio */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Paid Members</span>
                <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">
                  {paidMembersCount} / {totalMembersCount}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {totalMembersCount > 0 ? Math.round((paidMembersCount / totalMembersCount) * 100) : 0}% Collected
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Outstanding Unpaid */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-400">Outstanding Dues</span>
                <span className={`text-xl font-extrabold font-mono mt-0.5 block ${outstandingAmount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                  ${outstandingAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  {unpaidMembersCount} member{unpaidMembersCount !== 1 ? "s" : ""} pending
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Dues Settings Card */}
          <div className="bg-slate-800 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-2">
              <Settings className="w-4 h-4 text-emerald-400" /> Pool Buy-In & Payment Instructions Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Buy-In Fee Per Member ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={entryFee || ""}
                    onChange={(e) => setEntryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0 (Free Pool)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Set to 0 for free pools.</p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Payment Instructions / Note
                </label>
                <input
                  type="text"
                  value={duesNote}
                  onChange={(e) => setDuesNote(e.target.value)}
                  placeholder="e.g. Venmo @commish or CashApp $myname - Due before Week 1!"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400">This instruction note will be visible to pool members on their dashboard.</p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveDuesSettings}
                disabled={savingDuesSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingDuesSettings ? "Saving Settings..." : "Save Buy-In Settings"}
              </button>
            </div>
          </div>

          {/* Members Dues Tracking Checklist */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/70 pb-3">
              <div>
                <h4 className="text-white text-sm font-extrabold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" /> Member Dues Checklist
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Toggle paid status for each member. Click the shield icon next to a member's name to promote them to Co-Admin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleMarkAll(true)}
                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Paid
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(false)}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Mark All Unpaid
                </button>
                <button
                  type="button"
                  onClick={handleSavePayments}
                  disabled={savingDuesStatus}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs shadow-md shadow-emerald-500/10 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingDuesStatus ? "Saving..." : "Save Payment Statuses"}
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={duesSearch}
                  onChange={(e) => setDuesSearch(e.target.value)}
                  placeholder="Search player name..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setDuesFilter("all")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    duesFilter === "all" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDuesFilter("paid")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    duesFilter === "paid" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Paid ({paidMembersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDuesFilter("unpaid")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    duesFilter === "unpaid" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Unpaid ({unpaidMembersCount})
                </button>
              </div>
            </div>

            {/* Member List */}
            {loadingMembers ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Loading pool players...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-xs">
                {duesSearch ? "No members match your search filter." : "No players have submitted picks yet in this pool."}
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredMembers.map((m) => {
                  const payment = payments[m.userId] || { paid: false };
                  const isPaid = payment.paid;

                  return (
                    <div
                      key={m.userId}
                      className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isPaid
                          ? "bg-slate-900/80 border-emerald-500/30"
                          : "bg-slate-900/40 border-slate-800"
                      }`}
                    >
                      {/* Left: Avatar & Name */}
                      <div className="flex items-center gap-3">
                        {m.userPhotoURL ? (
                          <img
                            src={m.userPhotoURL}
                            alt={m.userDisplayName}
                            className="w-9 h-9 rounded-full bg-slate-950 p-0.5 border border-slate-700 object-contain flex-shrink-0 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0 uppercase">
                            {m.userDisplayName.substring(0, 2)}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">
                              {m.userDisplayName}
                            </span>
                            {isPaid ? (
                              <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-md flex items-center gap-1">
                                <Check className="w-3 h-3" /> Paid ${payment.amount ?? entryFee}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-md flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Unpaid
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Picks: <span className="text-slate-300 font-semibold">{m.pickCount} selections</span>
                            {payment.paidAt && (
                              <span className="ml-2 text-slate-500">
                                Paid on {new Date(payment.paidAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right: Payment Note & Toggle */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:w-auto w-full">
                        <input
                          type="text"
                          value={payment.note || ""}
                          onChange={(e) => handleUpdatePaymentNote(m.userId, e.target.value)}
                          placeholder="Note (e.g. Venmo, Cash)"
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-w-[140px]"
                        />

                        <button
                          type="button"
                          onClick={() => handleTogglePayment(m.userId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isPaid
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              <span>Mark Unpaid</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Paid (${entryFee})</span>
                            </>
                          )}
                        </button>


                        {m.userId !== pool.creatorId && (
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(m.userId, m.userDisplayName, pool.coAdmins?.includes(m.userId) || false)}
                            className={`px-2 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                              pool.coAdmins?.includes(m.userId)
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                            }`}
                            title={pool.coAdmins?.includes(m.userId) ? `Remove Admin Access from ${m.userDisplayName}` : `Make ${m.userDisplayName} an Admin`}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.userId, m.userDisplayName)}
                          className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={`Remove ${m.userDisplayName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "config" ? (
        // CONFIGURATION PANEL
        <div className="space-y-5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pick Your Pool&apos;s Active Futures
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-normal">
              Tailor your pool to your group! Check or uncheck categories below to choose exactly which questions will be active. Unchecked questions will be hidden from everyone and excluded from points/calculations.
            </p>
          </div>

          {/* Sticky header controls for Config */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-3 z-20 shadow-md">
            <div className="flex-1">
              <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Active Futures Pool Setup</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Toggle categories to restrict or expand active questions.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Deadline:</span>
                <input
                  type="datetime-local"
                  value={poolDeadline}
                  onChange={(e) => setPoolDeadline(e.target.value)}
                  className="bg-transparent text-white text-[11px] font-mono focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" /> {savingConfig ? "Saving..." : "Save Config"}
              </button>
            </div>
          </div>

          {/* Group 1: Awards */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {awardsQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-2 ${
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
                                        <div className="flex-1">
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 flex flex-col items-center ml-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Pts</label>
                        <input
                          type="number"
                          min="0"
                          value={getPoints(q)}
                          onChange={(e) => handlePointsChange(q.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Division Champions */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {divisionQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-2 ${
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
                                        <div className="flex-1">
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 flex flex-col items-center ml-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Pts</label>
                        <input
                          type="number"
                          min="0"
                          value={getPoints(q)}
                          onChange={(e) => handlePointsChange(q.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: Over/Unders */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ouQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-2 ${
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
                                        <div className="flex-1">
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 flex flex-col items-center ml-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Pts</label>
                        <input
                          type="number"
                          min="0"
                          value={getPoints(q)}
                          onChange={(e) => handlePointsChange(q.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 4: Division Standings */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {standingsQuestions.map((q) => {
                const isActive = activeQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center gap-2 ${
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
                                        <div className="flex-1">
                      <h4 className="font-bold text-xs">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 flex flex-col items-center ml-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Pts</label>
                        <input
                          type="number"
                          min="0"
                          value={getPoints(q)}
                          onChange={(e) => handlePointsChange(q.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === "grades" ? (
        // GRADING PANEL
        <div className="space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Enter Official Regular Season Outcomes
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-normal">
              Declare official final winners and division standings! As soon as you hit save, grades are recalculated instantly for all members. Leave categories empty until they are officially decided.
            </p>
          </div>

          {/* Sticky grading controls */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-3 sm:p-3 flex flex-col sm:flex-row justify-between items-center gap-2 sticky top-3 z-20 shadow-md">
            <div className="flex-grow">
              <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Unsaved Grades & Outcomes</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Grade predictions manually below, or auto-calculate outcomes from live NFL standings.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto items-stretch sm:items-center">
              {nflStandings && (
                <button
                  type="button"
                  onClick={handleAutoSyncNFL}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600/15 hover:bg-teal-600/25 border border-teal-500/30 text-teal-400 rounded-lg text-xs font-extrabold transition-all cursor-pointer justify-center"
                  title="Auto-fill results from ESPN live standing records"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Auto-grade with NFL Data
                </button>
              )}
              
              <button
                onClick={handleSaveResults}
                disabled={savingResults}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs disabled:opacity-50 transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-md shadow-amber-500/10"
              >
                <Save className="w-4 h-4" /> {savingResults ? "Saving..." : "Save Official Results"}
              </button>
            </div>
          </div>

          {/* Categories for grading */}
          
          
          {(categoryFilter === "all" || categoryFilter === "standings") && standingsQuestions.some(q => activeQuestions.includes(q.id)) && (
            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-2 pb-1 border-b border-slate-800">
                <ListOrdered className="w-4 h-4" /> NFL Division Standings Grader
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {standingsQuestions.filter(q => activeQuestions.includes(q.id)).map((q) => {
                  const currentOrder = getStandingOrder(q.id);
                  const isFullyGraded = currentOrder.every((t) => t !== "");

                  return (
                    <div key={q.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 space-y-2">
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
                            <div key={index} className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-850">
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
                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">
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
            <div className="space-y-2 pt-4">
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
                      className="p-3 hover:bg-slate-800/40 transition-colors flex flex-col xl:flex-row xl:justify-between xl:items-center gap-2"
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
                          className={`px-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                            currentWinner === "OVER"
                              ? "bg-amber-600 text-white shadow"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          OVER
                        </button>
                        <button
                          onClick={() => handleSelectWinner(q.id, "UNDER")}
                          className={`px-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
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

          {/* Tiebreaker Grading Section */}
          <div className="space-y-2 pt-4 border-t border-slate-700/50 mt-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              Tiebreaker (Super Bowl Total Points)
            </h3>
            <div className="bg-slate-800/60 border border-slate-700/50 hover:border-slate-700 rounded-xl p-3 shadow-sm">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <div className="text-xs text-slate-300 font-medium">
                   Official Final Points
                 </div>
                 <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={tiebreakerResult}
                      onChange={(e) => setTiebreakerResult(e.target.value)}
                      placeholder="e.g. 52"
                      className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setTiebreakerResult("")}
                      className={`px-2 py-1.5 ml-1 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                        tiebreakerResult ? "text-rose-400 hover:bg-rose-500/20" : "text-slate-600 cursor-default opacity-50"
                      }`}
                    >
                      CLR
                    </button>
                 </div>
               </div>
            </div>
          </div>

          {activeQuestionsList.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-800/20 border border-slate-800 rounded-xl">
              All questions have been disabled in pool settings. Switch to &quot;Configure Pool Futures&quot; above to activate them.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
