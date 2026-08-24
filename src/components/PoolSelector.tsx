import React, { useState, useEffect } from "react";
import { collection, collectionGroup, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Trophy, Plus, LogIn, Lock, Users, ArrowRight, AlertCircle, Sparkles, Heart, Activity, UserPlus, CheckCircle2, Edit3, Shield, CircleDollarSign, Copy, Check } from "lucide-react";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { AuthUser } from "../lib/auth";
import { FUTURES_QUESTIONS } from "../constants";
import { Pool } from "../types";
import Logo from "./Logo";

type ActivityItem = {
  id: string;
  type: 'join' | 'pick' | 'leaderboard';
  message: string;
  timestamp: Date;
  poolName: string;
};

interface PoolSelectorProps {
  user: AuthUser;
  onSelectPool: (pool: Pool) => void;
}

export default function PoolSelector({ user, onSelectPool }: PoolSelectorProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Pool State
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [newEntryFee, setNewEntryFee] = useState<string>("0");
  const [newDuesNote, setNewDuesNote] = useState<string>("");
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [poolMemberCounts, setPoolMemberCounts] = useState<Record<string, number>>({});

  const handleCopyNote = async (e: React.MouseEvent, poolId: string, text: string) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedNoteId(poolId);
        setTimeout(() => setCopiedNoteId(null), 2000);
        return;
      }
    } catch (err) {
      console.warn("Clipboard failed", err);
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopiedNoteId(poolId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Activity Feed State
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (pools.length === 0) return;

    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const feed: ActivityItem[] = [];
        const memberCountsMap: Record<string, number> = {};

        for (const pool of pools) {
          if (pool.createdAt) {
            const createdAt = pool.createdAt?.toDate ? pool.createdAt.toDate() : new Date();
            feed.push({
              id: `pool_create_${pool.id}`,
              type: 'leaderboard',
              message: `Pool created by ${pool.creatorName}`,
              timestamp: createdAt,
              poolName: pool.name
            });
          }

          const picksQuery = query(collection(db, `pools/${pool.id}/picks`));
          const pickSnaps = await getDocs(picksQuery);
          
          let userPicksCount = 0;
          pickSnaps.forEach(docSnap => {
            const data = docSnap.data();
            const isJoin = !data.selections || Object.keys(data.selections).length === 0;
            
            if (docSnap.id === user.uid && data.selections) {
              userPicksCount = Object.keys(data.selections).filter(k => !!data.selections[k] && (!k.startsWith("standings_") || data.selections[k].split(",").length === 4)).length;
            }
            
            if (data.updatedAt) {
               const ts = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
               
               feed.push({
                 id: `pick_${pool.id}_${docSnap.id}`,
                 type: isJoin ? 'join' : 'pick',
                 message: isJoin ? `${data.userDisplayName} joined the pool` : `${data.userDisplayName} locked in their picks`,
                 timestamp: ts,
                 poolName: pool.name
               });
            }
          });
          memberCountsMap[pool.id] = userPicksCount;
        }

        feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(feed.slice(0, 10));
        setPoolMemberCounts(memberCountsMap);
      } catch (e) {
        console.error("Failed to load activities", e);
      } finally {
        setLoadingActivities(false);
      }
    };

    loadActivities();
  }, [pools]);

  // Join Pool State
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Invite State
  const [invitePool, setInvitePool] = useState<Pool | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [joiningInvite, setJoiningInvite] = useState(false);

  // Membership lives in Firestore as pools/{poolId}/picks/{uid}. These
  // localStorage helpers are only a warm cache and a last-resort fallback when
  // Firestore can't be reached — never the source of truth. Treating them as
  // authoritative hid joined pools on every browser except the one that joined.
  const cacheKey = `joined_pools_${user.uid}`;

  const getSavedPoolIds = (): string[] => {
    try {
      const saved = localStorage.getItem(cacheKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const savePoolId = (id: string) => {
    try {
      const saved = getSavedPoolIds();
      if (!saved.includes(id)) {
        saved.push(id);
        localStorage.setItem(cacheKey, JSON.stringify(saved));
      }
    } catch (e) {
      console.error("Local storage save error", e);
    }
  };

  const cachePoolIds = (ids: string[]) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(ids));
    } catch (e) {
      console.error("Local storage save error", e);
    }
  };

  const checkInviteCode = async (code: string) => {
    const formattedCode = code.trim().toUpperCase();
    if (!formattedCode) return;

    setCheckingInvite(true);
    setInviteError(null);
    try {
      const poolQuery = query(
        collection(db, "pools"),
        where("code", "==", formattedCode)
      );
      const querySnap = await getDocs(poolQuery);

      if (querySnap.empty) {
        setInviteError(`Pool code "${formattedCode}" was not found.`);
        return;
      }

      const docSnap = querySnap.docs[0];
      const foundPool = { id: docSnap.id, ...docSnap.data() } as Pool;

      // Check if already a member or creator. The pick document is the
      // membership record, so this stays right on a device that has never
      // opened this pool before.
      const isCreator = foundPool.creatorId === user.uid;
      const pickSnap = await getDoc(
        doc(db, `pools/${foundPool.id}/picks`, user.uid)
      );
      const isMember = isCreator || pickSnap.exists();

      if (isMember) {
        // Already a member! Clean URL and open the pool
        window.history.replaceState({}, document.title, window.location.pathname);
        onSelectPool(foundPool);
      } else {
        setInvitePool(foundPool);
      }
    } catch (err) {
      console.error("Failed to check invite code", err);
      setInviteError("Could not verify your invitation code.");
    } finally {
      setCheckingInvite(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("join") || params.get("code");
    if (code) {
      checkInviteCode(code);
    }
  }, [user.uid]);

  // Every pool this user has joined, found from the pick documents they own.
  // The collection-group query needs the COLLECTION_GROUP index on
  // picks.userId (see firestore.indexes.json); while that index is still
  // building Firestore rejects the query, so fall back to scanning the pools
  // collection — same answer, just more reads. Returns null when neither path
  // works, so the caller knows the result isn't authoritative.
  const fetchJoinedPoolIds = async (): Promise<string[] | null> => {
    try {
      const picksSnap = await getDocs(
        query(collectionGroup(db, "picks"), where("userId", "==", user.uid))
      );
      return picksSnap.docs
        .map((d) => d.ref.parent.parent?.id)
        .filter((id): id is string => Boolean(id));
    } catch (groupErr) {
      console.warn("Picks collection-group query unavailable", groupErr);
    }

    try {
      const poolsSnap = await getDocs(collection(db, "pools"));
      const ids = await Promise.all(
        poolsSnap.docs.map(async (poolDoc) => {
          const pick = await getDoc(
            doc(db, `pools/${poolDoc.id}/picks`, user.uid)
          );
          return pick.exists() ? poolDoc.id : null;
        })
      );
      return ids.filter((id): id is string => Boolean(id));
    } catch (scanErr) {
      console.warn("Pool membership scan failed", scanErr);
      return null;
    }
  };

  const fetchPools = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedMap = new Map<string, Pool>();

      // 1. Fetch pools created by user
      const creatorQuery = query(
        collection(db, "pools"),
        where("creatorId", "==", user.uid)
      );
      const creatorSnap = await getDocs(creatorQuery);
      creatorSnap.forEach((docSnap) => {
        fetchedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Pool);
      });

      // 2. Fetch pools the user joined, from Firestore rather than this
      // browser's cache. Only fall back to the cache if Firestore couldn't
      // answer at all.
      const joinedIds = await fetchJoinedPoolIds();
      const idsToLoad = joinedIds ?? getSavedPoolIds();
      await Promise.all(
        idsToLoad.map(async (id) => {
          if (fetchedMap.has(id)) return;
          const poolDoc = await getDoc(doc(db, "pools", id));
          if (poolDoc.exists()) {
            fetchedMap.set(id, { id: poolDoc.id, ...poolDoc.data() } as Pool);
          }
        })
      );

      const found = Array.from(fetchedMap.values());
      setPools(found);
      // Re-seed the warm cache only from an authoritative read, so a pool the
      // user actually left doesn't linger forever.
      if (joinedIds) cachePoolIds(found.map((p) => p.id));
    } catch (err) {
      console.error(err);
      setError("Failed to load your pools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [user.uid]);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    setCreating(true);
    setError(null);

    const generatedId = "pool_" + Math.random().toString(36).substr(2, 9);
    const poolPath = `pools/${generatedId}`;

    const parsedFee = Math.max(0, Number(newEntryFee) || 0);
    const newPoolData = {
      id: generatedId,
      name: newName.trim(),
      description: newDesc.trim() || "",
      code: newCode.trim().toUpperCase(),
      creatorId: user.uid,
      creatorName: user.displayName || "Unknown User",
      createdAt: serverTimestamp(),
      results: {},
      entryFee: parsedFee,
      duesNote: newDuesNote.trim(),
      payments: {},
      activeQuestions: FUTURES_QUESTIONS.map((q) => q.id)
    };

    try {
      // Create pool document
      await setDoc(doc(db, "pools", generatedId), newPoolData);

      // Create initial empty picks inside the pool subcollection to establish membership
      await setDoc(doc(db, `pools/${generatedId}/picks`, user.uid), {
        userId: user.uid,
        userDisplayName: user.displayName || "Player",
        userPhotoURL: user.photoURL || "",
        selections: {},
        updatedAt: serverTimestamp()
      });

      savePoolId(generatedId);
      
      // Cleanup & Select
      setNewName("");
      setNewDesc("");
      setNewCode("");
      setShowCreate(false);
      
      const completePool: Pool = {
        ...newPoolData,
        createdAt: new Date()
      };
      
      onSelectPool(completePool);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, poolPath);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinPool = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = joinCode.trim().toUpperCase();
    if (!formattedCode) return;

    setJoining(true);
    setJoinError(null);

    try {
      // Find the pool with this join code
      const poolQuery = query(
        collection(db, "pools"),
        where("code", "==", formattedCode)
      );
      const querySnap = await getDocs(poolQuery);

      if (querySnap.empty) {
        setJoinError("Pool code not found. Please verify with the creator.");
        setJoining(false);
        return;
      }

      const poolDoc = querySnap.docs[0];
      const poolData = poolDoc.data() as Pool;

      // Add to user's picks to confirm membership in subcollection
      const pickDocRef = doc(db, `pools/${poolDoc.id}/picks`, user.uid);
      const pickDocSnap = await getDoc(pickDocRef);

      if (!pickDocSnap.exists()) {
        await setDoc(pickDocRef, {
          userId: user.uid,
          userDisplayName: user.displayName || "Player",
          userPhotoURL: user.photoURL || "",
          selections: {},
          updatedAt: serverTimestamp()
        });
      }

      savePoolId(poolDoc.id);
      setJoinCode("");
      onSelectPool({ ...poolData, id: poolDoc.id });
    } catch (err) {
      console.error(err);
      setJoinError("Error joining pool. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#09222c] to-[#041014] border border-[#113a4b]/80 rounded-2xl p-6 sm:p-10 mb-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="max-w-2xl relative z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Welcome to the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Conch Predictor Series</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select a pool below to get started, or create a new one to invite your friends.
          </p>
        </div>
        
        <div className="relative z-10 hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-[#09222c] to-[#041014] border border-[#113a4b] rounded-3xl shadow-2xl overflow-hidden group">
          <div className="absolute -bottom-8 -right-8 p-4 opacity-15 transform group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-all duration-700">
            <Trophy className="w-48 h-48 text-teal-400" />
          </div>
          <div className="flex flex-col gap-4 relative z-20">
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-2 font-display">Are you ready for kickoff?</h3>
              <p className="text-teal-100/60 text-sm leading-relaxed max-w-sm">
                Lock in your predictions for division winners, major awards, and every team's over/under win totals before the season starts.
              </p>
            </div>
            <div className="inline-flex items-center justify-center px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest rounded-full w-fit mt-2">
              2026-2027 Season
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Active / Checking banner */}
      {checkingInvite && (
        <div className="bg-[#09222c] border border-[#113a4b]/50 rounded-2xl p-4 mb-3 flex items-center gap-3 shadow-md">
          <div className="w-4 h-4 rounded-full border-2 border-teal-500/25 border-t-teal-400 animate-spin"></div>
          <p className="text-slate-400 text-xs font-mono">Verifying your invitation code...</p>
        </div>
      )}

      {inviteError && !invitePool && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-3 text-rose-300 text-xs flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div className="flex-grow">
            <h4 className="font-bold text-sm text-rose-200">Invalid Invitation Link</h4>
            <p className="text-slate-400 mt-1">{inviteError}</p>
            <button 
              onClick={() => {
                setInviteError(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="mt-3 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold rounded border border-rose-500/25 transition-all cursor-pointer text-[10px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {invitePool && (
        <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-2xl p-3 mb-3 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Active Invitation
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                🏈 You&apos;ve Been Invited!
              </h3>
              <h2 className="text-xl font-black text-white">
                Join &ldquo;{invitePool.name}&rdquo;
              </h2>
              {invitePool.description && (
                <p className="text-slate-300 text-sm max-w-xl italic">
                  &ldquo;{invitePool.description}&rdquo;
                </p>
              )}
              <p className="text-xs text-slate-400">
                Created by <span className="text-slate-300 font-semibold">{invitePool.creatorName}</span> • Passcode: <span className="font-mono text-emerald-400 font-bold">{invitePool.code}</span>
              </p>

              {/* Payment & Pot Info on Invite Banner */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs max-w-full shadow-sm mt-1">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {(invitePool.entryFee || 0) > 0 ? (
                  <span className="font-mono text-emerald-300 font-bold">${invitePool.entryFee} Buy-In</span>
                ) : (
                  <span className="text-emerald-300 font-bold">Free Pool</span>
                )}
                {invitePool.duesNote && (
                  <>
                    <span className="text-slate-700">|</span>
                    <span className="text-slate-300 text-xs font-medium truncate max-w-xs">
                      Pay Info: {invitePool.duesNote}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setInvitePool(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-slate-700/40 transition-all cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={async () => {
                  setJoiningInvite(true);
                  try {
                    const pickDocRef = doc(db, `pools/${invitePool.id}/picks`, user.uid);
                    const pickDocSnap = await getDoc(pickDocRef);

                    if (!pickDocSnap.exists()) {
                      await setDoc(pickDocRef, {
                        userId: user.uid,
                        userDisplayName: user.displayName || "Player",
                        userPhotoURL: user.photoURL || "",
                        selections: {},
                        updatedAt: serverTimestamp()
                      });
                    }

                    savePoolId(invitePool.id);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setInvitePool(null);
                    onSelectPool(invitePool);
                  } catch (err) {
                    console.error(err);
                    setInviteError("Failed to join the pool. Please try again.");
                  } finally {
                    setJoiningInvite(false);
                  }
                }}
                disabled={joiningInvite}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/10 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {joiningInvite ? "Joining..." : "Accept & Join Pool"}
              </button>
            </div>
          </div>
          {inviteError && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Pools List (spans 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Your Active Pools
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-24 bg-[#09222c]/40 animate-pulse rounded-xl border border-[#113a4b]/30"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : pools.length === 0 ? (
            <div className="bg-[#09222c]/40 border border-[#113a4b]/50 rounded-xl p-4 text-center">
              <Users className="w-10 h-10 text-teal-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">You haven&apos;t joined any pools yet.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Create Your First Pool
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pools.map((pool) => {
                const isCreator = pool.creatorId === user.uid;
                return (
                  <div
                    key={pool.id}
                    onClick={() => onSelectPool(pool)}
                    className="group relative bg-[#09222c] hover:bg-[#0c2e3b] border border-[#113a4b]/60 hover:border-teal-500/40 rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors duration-150">
                          {pool.name}
                        </h3>
                        {pool.description && (
                          <p className="text-slate-400 text-xs mt-1 line-clamp-1 max-w-sm">
                            {pool.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#041014] border border-[#113a4b]/40 text-teal-400">
                            Code: {pool.code}
                          </span>
                          {isCreator ? (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              By {pool.creatorName}
                            </span>
                          )}
                        </div>

                        {/* Picks Count & Paid Status */}
                        <div 
                          className="mt-3 p-2 bg-[#041014]/90 border border-[#113a4b]/50 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 group-hover:border-teal-500/40 transition-colors"
                          onClick={(e) => {
                            // Don't stop propagation so clicking the card opens the pool
                          }}
                        >
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400/70" />
                            <span>
                              {poolMemberCounts[pool.id] || 0} / {FUTURES_QUESTIONS.length} Picks
                            </span>
                          </div>

                          {(pool.entryFee || 0) > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              pool.payments?.[user.uid]?.paid
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}>
                              {pool.payments?.[user.uid]?.paid ? "Buy-In Paid ✅" : "Fee Pending 💸"}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="p-2 bg-[#041014]/50 rounded-lg group-hover:bg-teal-500/10 group-hover:text-teal-400 text-slate-500 transition-all duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Action Cards (Join / Create) */}
        <div className="space-y-6">
          {/* Join Pool Form */}
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-3 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <LogIn className="w-5 h-5 text-teal-400" /> Join a Pool
            </h2>
            <form onSubmit={handleJoinPool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-2">
                  Enter 6-Character Pool Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="E.G. CHAMPX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-600 focus:outline-none focus:border-teal-500 uppercase transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={joining || !joinCode.trim()}
                    className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-lg text-xs shadow-md disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
                  >
                    {joining ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
              {joinError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Create Pool Form or trigger */}
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-3 shadow-xl">
            {!showCreate ? (
              <div className="text-center py-2">
                <p className="text-slate-300 text-sm mb-4">Want to run your own pool with custom standings?</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create a New Pool
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-teal-400" /> Create a Pool
                  </h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreatePool} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-1.5">
                      Pool Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="My Office NFL Pool"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={100}
                      className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-1.5">
                      Description <span className="text-teal-600/60">(Optional)</span>
                    </label>
                    <textarea
                      placeholder="Prizes, deadlines, or friendly chatter..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-1.5">
                      Join Passcode <span className="text-amber-400/80">- For your friends to enter</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.G. SUPER59"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      maxLength={20}
                      className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-2.5 text-white text-sm font-mono uppercase placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-1.5">
                        Entry Fee ($ USD) <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newEntryFee}
                        onChange={(e) => setNewEntryFee(e.target.value)}
                        className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-teal-400/80 uppercase tracking-wider mb-1.5">
                        Payment Handles <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Venmo: @commissioner"
                        value={newDuesNote}
                        onChange={(e) => setNewDuesNote(e.target.value)}
                        className="w-full bg-[#041014] border border-[#113a4b]/60 rounded-xl px-4 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creating || !newName.trim() || !newCode.trim()}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-md disabled:opacity-50 transition-all duration-200 cursor-pointer"
                  >
                    {creating ? "Creating..." : "Build This Pool"}
                  </button>
                </form>
              </div>
            )}
          </div>
          {/* Activity Feed */}
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-teal-400" /> Recent Activity
            </h2>
            {loadingActivities ? (
              <div className="flex justify-center items-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-teal-500/25 border-t-teal-400 animate-spin"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No recent activity to display.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                    <div className="mt-0.5 shrink-0">
                      {act.type === 'join' && <UserPlus className="w-4 h-4 text-indigo-400" />}
                      {act.type === 'pick' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {act.type === 'leaderboard' && <Trophy className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-200">
                        {act.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-teal-500/70 font-mono uppercase tracking-wider">{act.poolName}</span>
                        <span className="text-[9px] text-slate-500">•</span>
                        <span className="text-[9px] text-slate-500">
                          {act.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {act.timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
