import React, { useState, useEffect } from "react";
import { ArrowLeft, Award, Users, Save, MessageSquare, Sparkles, Settings, Copy, Check, Share2, RefreshCw, Search, History, Clock, Timer, CircleDollarSign, User, Receipt, Edit3, DollarSign, ExternalLink } from "lucide-react";
import PaymentInfoModal from "./PaymentInfoModal";
import { Pool, Picks } from "../types";
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthUser } from "../lib/auth";
import StandingsTab from "./StandingsTab";
import PicksTab from "./PicksTab";
import ComparePicksTab from "./ComparePicksTab";
import AdminTab from "./AdminTab";
import ChatTab from "./ChatTab";
import LastYearResultsTab from "./LastYearResultsTab";
import ProfileTab from "./ProfileTab";
import { fetchNflStandings, TeamStandingInfo } from "../lib/nflApi";
import { FUTURES_QUESTIONS } from "../constants";

interface PoolDetailProps {
  pool: Pool;
  user: AuthUser;
  onBack: () => void;
}

type TabType = "standings" | "my_picks" | "compare" | "admin" | "last_year" | "chat" | "profile";

export function getAppShareUrl(code: string): string {
  const defaultPublicUrl = "https://ais-pre-xfiomcrem6vpcrlcdoi546-387114323884.us-east1.run.app";
  
  if (typeof window === "undefined") {
    return `${defaultPublicUrl}/?join=${code}`;
  }

  const hostname = window.location.hostname;
  const origin = window.location.origin;

  const isInternalOrDev =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".google.com") ||
    hostname.endsWith(".googleusercontent.com") ||
    hostname.endsWith("ai.studio") ||
    hostname.includes("ais-dev");

  const baseUrl = isInternalOrDev ? defaultPublicUrl : origin;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/?join=${code}`;
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        return {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 mt-2 sm:mt-0">
        <Clock className="w-4 h-4 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Deadline Passed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-md shadow-sm mt-2 sm:mt-0">
      <Timer className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex flex-col">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Pick Deadline</span>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
          {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
          <span>{timeLeft.h.toString().padStart(2, '0')}h</span>
          <span>{timeLeft.m.toString().padStart(2, '0')}m</span>
          <span>{timeLeft.s.toString().padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
};

export default function PoolDetail({ pool: initialPool, user, onBack }: PoolDetailProps) {
  const [pool, setPool] = useState<Pool>(initialPool);
  const [userPicks, setUserPicks] = useState<Picks | null>(null);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("standings");
  const [adminSubTab, setAdminSubTab] = useState<"grades" | "dues" | "config">("grades");
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [duesNoteCopied, setDuesNoteCopied] = useState(false);

  const handleCopyDuesNote = async () => {
    if (!pool.duesNote) return;
    const success = await copyToClipboard(pool.duesNote);
    if (success) {
      setDuesNoteCopied(true);
      setTimeout(() => setDuesNoteCopied(false), 2000);
    }
  };
  
  // Real-time NFL Standings from ESPN
  const [nflStandings, setNflStandings] = useState<Record<string, TeamStandingInfo> | null>(null);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);

  // Subscribe to pool picks count for live entries & total pot
  useEffect(() => {
    const unsubPicks = onSnapshot(collection(db, `pools/${initialPool.id}/picks`), (snapshot) => {
      setMemberCount(snapshot.size);
    });
    return () => unsubPicks();
  }, [initialPool.id]);

  // Subscribe to real-time pool document updates to capture results updates instantly
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "pools", initialPool.id), (docSnap) => {
      if (docSnap.exists()) {
        setPool({ id: docSnap.id, ...docSnap.data() } as Pool);
      }
    });
    return () => unsub();
  }, [initialPool.id]);

  // Fetch the current NFL team records from ESPN
  const loadStandingsData = async () => {
    setLoadingStandings(true);
    try {
      const data = await fetchNflStandings();
      setNflStandings(data);
    } catch (err) {
      console.warn("Failed to retrieve live NFL standings:", err);
    } finally {
      setLoadingStandings(false);
    }
  };

  useEffect(() => {
    loadStandingsData();
  }, []);

  // Fetch the current user's submitted picks inside this pool
  const fetchUserPicks = async () => {
    setLoadingPicks(true);
    try {
      const pickDocRef = doc(db, `pools/${initialPool.id}/picks`, user.uid);
      const pickDocSnap = await getDoc(pickDocRef);
      if (pickDocSnap.exists()) {
        const pickData = pickDocSnap.data();
        // Self-heal: If user has a photoURL in Auth but this pool's pick has a blank or outdated photoURL, sync it
        if (user.photoURL && pickData.userPhotoURL !== user.photoURL) {
          updateDoc(pickDocRef, {
            userPhotoURL: user.photoURL,
            userDisplayName: user.displayName || pickData.userDisplayName || "Player",
            updatedAt: serverTimestamp(),
          }).catch(console.debug);
        }

        setUserPicks({
          id: pickDocSnap.id,
          ...pickData,
          userDisplayName: user.displayName || pickData.userDisplayName || "Player",
          userPhotoURL: user.photoURL || pickData.userPhotoURL || "",
        } as any);
      } else {
        setUserPicks(null);
      }
    } catch (err) {
      console.error("Failed to load user picks", err);
    } finally {
      setLoadingPicks(false);
    }
  };

  useEffect(() => {
    fetchUserPicks();
  }, [pool.id, user.uid]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern asynchronous clipboard API first
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, trying selection fallback:", err);
      }
    }

    // Classic selection fallback (highly reliable in iframes or document focus issues)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Selection-based clipboard fallback failed:", err);
      return false;
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(pool.code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSharePool = async () => {
    const shareUrl = getAppShareUrl(pool.code);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my NFL Futures Pool: ${pool.name}`,
          text: `Join my Conch Predictor NFL Futures Pick'Em pool "${pool.name}" using the passcode ${pool.code}!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // If share was cancelled or failed, fall back to copy
        console.log("Share API error or cancelled, falling back to copy", err);
      }
    }
    
    // Fallback: Robust Clipboard copy
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } else {
      console.error("Failed to copy link using all methods");
    }
  };

  const isCreator = pool.creatorId === user.uid || (pool.coAdmins && pool.coAdmins.includes(user.uid));

  const totalQuestions = FUTURES_QUESTIONS.length;
  const completedPicksCount = userPicks?.selections 
    ? Object.keys(userPicks.selections).filter(k => !!userPicks.selections[k] && (!k.startsWith("standings_") || userPicks.selections[k].split(",").length === 4)).length 
    : 0;
  const isPicksComplete = completedPicksCount === totalQuestions && userPicks?.tiebreaker;

  return (
    <div className="max-w-7xl mx-auto py-1 px-2 sm:px-2">
      {/* Pool Header / Banner */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-2 shadow-lg mb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Pools
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
          <div className="flex-1 min-w-0">
            {/* Title row with Countdown */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{pool.name}</h1>
              <CountdownTimer targetDate={pool.deadline?.toDate ? pool.deadline.toDate() : (pool.deadline ? new Date(pool.deadline) : new Date("2026-09-10T20:20:00-04:00"))} />
            </div>

            {/* Single Unified Payment, Total Pot & Instructions Bar (Always displayed) */}
            <div className="mt-2 inline-flex flex-wrap items-center gap-2 sm:gap-2.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs max-w-full shadow-sm transition-all">
              {/* Money & Total Pot */}
              <div 
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0 cursor-pointer"
                title="Click to view payment details"
              >
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {(pool.entryFee || 0) > 0 ? (
                  <span className="font-mono text-emerald-300 font-extrabold">${pool.entryFee} Buy-In</span>
                ) : (
                  <span className="text-emerald-300 font-bold">Free Pool</span>
                )}

                {(pool.entryFee || 0) > 0 && (
                  <span className="text-slate-400 font-normal">
                    • Pot: <strong className="text-white font-mono font-bold hover:text-emerald-300 underline decoration-emerald-500/50 underline-offset-2 transition-colors">${(pool.entryFee || 0) * Math.max(memberCount, 1)}</strong>
                  </span>
                )}

                {(pool.entryFee || 0) > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ml-0.5 ${
                    pool.payments?.[user.uid]?.paid
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {pool.payments?.[user.uid]?.paid ? "Buy-In Paid ✅" : "Fee Pending 💸"}
                  </span>
                )}
              </div>

              {/* Payment Instructions / Handle Note (Only show if UNPAID) */}
              {pool.duesNote && !pool.payments?.[user.uid]?.paid ? (
                <>
                  <span className="text-slate-700 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 hidden md:inline">
                      Pay Info:
                    </span>
                    <span 
                      onClick={() => setShowPaymentModal(true)}
                      className="text-slate-200 truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md font-medium text-xs cursor-pointer hover:text-white"
                      title={pool.duesNote}
                    >
                      {pool.duesNote}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDuesNote}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 rounded transition-colors cursor-pointer shrink-0"
                      title="Copy payment instructions"
                    >
                      {duesNoteCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                isCreator && !pool.duesNote && (
                  <>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="text-[11px] text-emerald-400/90 hover:text-emerald-300 font-medium cursor-pointer"
                    >
                      + Add payment instructions
                    </button>
                  </>
                )
              )}

              {/* Edit / Details Action */}
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold ml-auto shrink-0 cursor-pointer hover:underline flex items-center gap-1"
              >
                {isCreator ? (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>{pool.duesNote || (pool.entryFee || 0) > 0 ? "Edit" : "+ Setup"}</span>
                  </>
                ) : (
                  <span>Payouts & Details</span>
                )}
              </button>
            </div>

            {pool.description && (
              <p className="text-slate-400 text-xs mt-1.5 max-w-xl line-clamp-1 leading-relaxed">
                {pool.description}
              </p>
            )}
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Created by {pool.creatorName}
            </p>
          </div>
          {/* Code and Invite panel */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-900 border border-slate-700/40 p-2 rounded-xl shadow-inner w-full lg:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div>
                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">
                  Friends Join Code
                </span>
                <span className="text-sm font-mono font-black text-emerald-400 tracking-wider">
                  {pool.code}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none px-1.5 py-1 bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold min-w-[110px]"
                title="Copy Code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSharePool}
                className="flex-1 sm:flex-none px-1.5.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs min-w-[110px] shadow-sm shadow-emerald-500/10"
                title="Share Pool Invite Link"
              >
                {shareCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span className="text-[10px] font-black">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Pool</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 gap-1 sm:gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("standings")}
          className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "standings"
              ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4" /> Standings
        </button>

        <button
          onClick={() => setActiveTab("my_picks")}
          className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "my_picks"
              ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Save className="w-4 h-4" /> My Picks
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "compare"
              ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" /> Compare Picks
        </button>

        <button
          onClick={() => setActiveTab("last_year")}
          className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "last_year"
              ? "bg-slate-800 text-indigo-400 border-b-2 border-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" /> Last Year
        </button>

        {isCreator && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "admin"
                ? "bg-slate-800 text-amber-400 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" /> Admin Controls
          </button>
        )}
        
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-2 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "chat"
              ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-2.5 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "profile"
              ? "bg-slate-800 text-emerald-400 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-4 h-4 rounded-full bg-slate-950 object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span>My Profile</span>
        </button>
      </div>

      
      {activeTab === "standings" && !isPicksComplete && (
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-4 mb-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-emerald-400 font-extrabold text-lg flex items-center gap-2 mb-1">
              <Timer className="w-5 h-5" /> 
              Make Your Predictions!
            </h3>
            <p className="text-emerald-100/70 text-sm max-w-xl">
              You've completed <strong className="text-emerald-300">{completedPicksCount}</strong> of <strong className="text-emerald-300">{totalQuestions}</strong> picks. Lock in your future picks before kickoff!
            </p>
          </div>
          <button
            onClick={() => setActiveTab("my_picks")}
            className="w-full md:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Complete My Picks
          </button>
        </div>
      )}


      {/* Tabs panels render */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 sm:p-2 min-h-[50vh] shadow-inner">
        {activeTab === "standings" && (
          <StandingsTab pool={pool} user={user} userPicks={userPicks} categoryFilter={categoryFilter} nflStandings={nflStandings || undefined} />
        )}

        {activeTab === "my_picks" && (
          loadingPicks ? (
            <div className="text-center py-12 text-slate-400">Loading your selections...</div>
          ) : (
            <PicksTab
              pool={pool}
              user={user}
              userPicks={userPicks}
              onPicksSaved={(newPicks) => setUserPicks(newPicks)}
              onNavigateToStandings={() => setActiveTab("standings")}
              categoryFilter={categoryFilter}
              nflStandings={nflStandings || undefined}
            />
          )
        )}

        {activeTab === "compare" && <ComparePicksTab pool={pool} categoryFilter={categoryFilter} nflStandings={nflStandings || undefined} />}

        {activeTab === "last_year" && <LastYearResultsTab />}

        {activeTab === "chat" && (
          <ChatTab pool={pool} user={user} />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            pool={pool}
            user={user}
            userPicks={userPicks}
            onProfileUpdated={fetchUserPicks}
          />
        )}

        {activeTab === "admin" && isCreator && (
          <AdminTab
            pool={pool}
            onPoolUpdated={(updatedPool) => setPool(updatedPool)}
            categoryFilter={categoryFilter}
            nflStandings={nflStandings || undefined}
            activeSubTab={adminSubTab}
            onSubTabChange={setAdminSubTab}
          />
        )}
      </div>
    
      {/* Payment Info & Dues Modal (Accessible to all members) */}
      <PaymentInfoModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        pool={pool}
        isCreator={isCreator}
        currentUserId={user.uid}
        memberCount={memberCount}
        onPoolUpdated={(updatedPool) => setPool(updatedPool)}
        onNavigateToDuesTracker={() => {
          setActiveTab("admin");
          setAdminSubTab("dues");
        }}
      />
    </div>
  );
}