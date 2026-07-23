import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Trophy, LogOut, Shield, Heart, Zap, Sparkles, UserCheck, Compass, Award, ListOrdered } from "lucide-react";
import { auth } from "./lib/firebase";
import { Pool } from "./types";
import PoolSelector from "./components/PoolSelector";
import PoolDetail from "./components/PoolDetail";
import Logo from "./components/Logo";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Sign-in error", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSelectedPool(null);
    } catch (err) {
      console.error("Sign-out error", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061217] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500/25 border-t-teal-400 animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-xs">Loading Conch Predictor Series...</p>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#061217] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative stadium grid background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,165,185,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,165,185,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Hero */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <Logo size={84} variant="full" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 font-display leading-tight">
              Predict the NFL.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Prove You're the Best.</span>
            </h1>
            <p className="text-teal-200/70 text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Rub the magic conch and compete against your friends! Build private pools, pick division winners, awards, super bowl champions, and over/under win totals.
            </p>

            <button
              onClick={handleSignIn}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-[0_0_40px_-10px_rgba(20,184,166,0.4)] transform hover:-translate-y-1 transition-all cursor-pointer text-base sm:text-lg"
            >
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-12 flex justify-center lg:justify-start gap-8 text-[10px] sm:text-xs uppercase font-mono tracking-wider text-teal-500/80">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-teal-400" /> Private Pools</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-400" /> Live Standings</span>
            </div>
          </div>

          {/* Right Visuals Bento Box (Hidden on mobile) */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-5 relative z-10">
              <div className="space-y-5">
                <div className="bg-[#09222c]/80 backdrop-blur-md border border-[#113a4b]/80 rounded-3xl p-6 shadow-2xl transform translate-y-8 hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/30">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Major Awards</h3>
                  <p className="text-teal-100/60 text-xs leading-relaxed">Predict MVP, OPOY, DPOY, and Rookie of the Year candidates.</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl transform translate-y-8 hover:-translate-y-2 transition-transform duration-500 delay-100">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/30">
                    <Compass className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Division Winners</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Lock in the kings of the North, South, East, and West.</p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="bg-[#09222c]/80 backdrop-blur-md border border-teal-500/30 rounded-3xl p-6 shadow-2xl hover:-translate-y-2 transition-transform duration-500 delay-75">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/30">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Live Standings</h3>
                  <p className="text-teal-100/60 text-xs leading-relaxed">Track your group's points live as the NFL season progresses.</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-500 delay-150">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-5 border border-rose-500/30">
                    <Heart className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Over / Unders</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Analyze the lines and call the win totals for every team.</p>
                </div>
              </div>
            </div>
            
            {/* Glow backing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-teal-500/20 to-cyan-500/10 blur-[100px] -z-10 rounded-full"></div>
          </div>
        </div>
      </div>

        {/* Humble and minimalist football card footer */}
        <footer className="text-center py-2 text-teal-800 text-xs font-mono">
          Conch Predictor Series • UTC 2026
        </footer>
      </div>
    );
  }

  // Signed in layout
  return (
    <div className="min-h-screen bg-[#061217] flex flex-col">
      {/* Navbar dashboard */}
      <header className="border-b border-[#113a4b]/50 bg-[#071d26]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 h-12 flex items-center justify-between">
          <div
            onClick={() => setSelectedPool(null)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo size={40} variant="full" className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold tracking-tight text-white text-base font-display">
              Conch Predictor Series
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile summary */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-5 h-5 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-300 uppercase">
                  {user.displayName?.charAt(0)}
                </div>
              )}
              <span className="text-slate-300 text-xs font-semibold max-w-[120px] truncate">
                {user.displayName || "User"}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace container */}
      <main className="flex-grow pb-4">
        {selectedPool ? (
          <PoolDetail
            pool={selectedPool}
            user={user}
            onBack={() => setSelectedPool(null)}
          />
        ) : (
          <PoolSelector
            user={user}
            onSelectPool={(pool) => setSelectedPool(pool)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#113a4b]/40 bg-[#041014]/40 text-center py-2 text-teal-800 text-xs font-mono">
        Conch Predictor Series • Predictions & Standings
      </footer>
    </div>
  );
}
