import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Trophy, Plus, LogIn, Lock, Users, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { FUTURES_QUESTIONS } from "../constants";
import { Pool } from "../types";
import Logo from "./Logo";

interface PoolSelectorProps {
  user: any;
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

  // Join Pool State
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Invite State
  const [invitePool, setInvitePool] = useState<Pool | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [joiningInvite, setJoiningInvite] = useState(false);

  // Local storage keys to track joined pools
  const getSavedPoolIds = (): string[] => {
    try {
      const saved = localStorage.getItem(`joined_pools_${user.uid}`);
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
        localStorage.setItem(`joined_pools_${user.uid}`, JSON.stringify(saved));
      }
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

      // Check if already a member or creator
      const savedIds = getSavedPoolIds();
      const isCreator = foundPool.creatorId === user.uid;
      const isMember = savedIds.includes(foundPool.id) || isCreator;

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

      // 2. Fetch saved pool IDs from local storage
      const savedIds = getSavedPoolIds();
      for (const id of savedIds) {
        if (!fetchedMap.has(id)) {
          const poolDoc = await getDoc(doc(db, "pools", id));
          if (poolDoc.exists()) {
            fetchedMap.set(id, { id: poolDoc.id, ...poolDoc.data() } as Pool);
          }
        }
      }

      setPools(Array.from(fetchedMap.values()));
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

    const newPoolData = {
      id: generatedId,
      name: newName.trim(),
      description: newDesc.trim() || "",
      code: newCode.trim().toUpperCase(),
      creatorId: user.uid,
      creatorName: user.displayName || "Unknown User",
      createdAt: serverTimestamp(),
      results: {},
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <Logo size={240} variant="full" />
        </div>
        <div className="max-w-2xl relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Conch Predictor Series
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Rub the magic conch and compete against your friends to see who can predict NFL futures the best! Choose division winners, major awards, super bowl champions, and over/under win totals. Create a pool, invite friends with a code, and track standings as the season unfolds.
          </p>
        </div>
      </div>

      {/* Invitation Active / Checking banner */}
      {checkingInvite && (
        <div className="bg-[#09222c] border border-[#113a4b]/50 rounded-2xl p-4 mb-8 flex items-center gap-3 shadow-md">
          <div className="w-4 h-4 rounded-full border-2 border-teal-500/25 border-t-teal-400 animate-spin"></div>
          <p className="text-slate-400 text-xs font-mono">Verifying your invitation code...</p>
        </div>
      )}

      {inviteError && !invitePool && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-8 text-rose-300 text-xs flex items-start gap-3 shadow-md">
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
        <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Active Invitation
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left column: Pools List */}
        <div className="space-y-6">
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
            <div className="bg-[#09222c]/40 border border-[#113a4b]/50 rounded-xl p-8 text-center">
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
            <div className="space-y-3">
              {pools.map((pool) => {
                const isCreator = pool.creatorId === user.uid;
                return (
                  <div
                    key={pool.id}
                    onClick={() => onSelectPool(pool)}
                    className="group relative bg-[#09222c] hover:bg-[#0c2e3b] border border-[#113a4b]/60 hover:border-teal-500/40 rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors duration-150">
                          {pool.name}
                        </h3>
                        {pool.description && (
                          <p className="text-slate-400 text-xs mt-1 line-clamp-1 max-w-sm">
                            {pool.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
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
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-6 shadow-xl">
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
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-6 shadow-xl">
            {!showCreate ? (
              <div className="text-center py-4">
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
        </div>
      </div>
    </div>
  );
}
