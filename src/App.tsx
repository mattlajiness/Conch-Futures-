import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Trophy, LogOut, Shield, Heart, Zap, Sparkles, UserCheck } from "lucide-react";
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
          <div className="max-w-md w-full bg-[#09222c] border border-[#113a4b]/80 rounded-3xl p-8 text-center shadow-2xl relative">
            {/* Logo ornament */}
            <div className="flex justify-center mb-6">
              <Logo size={84} variant="full" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
              Conch Predictor Series
            </h1>
            <p className="text-teal-200/60 text-sm leading-relaxed mb-8">
              Rub the magic conch and compete against your friends to see who can predict NFL futures the best! Choose division winners, major awards, super bowl champions, and over/under win totals. Create a pool, invite friends with a code, and track standings as the season unfolds.
            </p>

            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-lg hover:shadow-teal-500/10 transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {/* Google G logo SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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

            <div className="mt-8 pt-6 border-t border-[#144458]/40 flex justify-center gap-6 text-[10px] uppercase font-mono tracking-wider text-teal-500/80">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-teal-400/80" /> Secure Rules
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400/80" /> Live Standings
              </span>
            </div>
          </div>
        </div>

        {/* Humble and minimalist football card footer */}
        <footer className="text-center py-6 text-teal-800 text-xs font-mono">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
      <main className="flex-grow pb-16">
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
      <footer className="border-t border-[#113a4b]/40 bg-[#041014]/40 text-center py-6 text-teal-800 text-xs font-mono">
        Conch Predictor Series • Predictions & Standings
      </footer>
    </div>
  );
}
