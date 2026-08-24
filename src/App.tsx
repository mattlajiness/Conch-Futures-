import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "./lib/auth";
import { trackScreenView } from "./lib/analytics";
import { Pool } from "./types";
import PoolSelector from "./components/PoolSelector";
import PoolDetail from "./components/PoolDetail";
import LoginPage from "./components/LoginPage";
import HostBar from "./components/HostBar";
import Logo from "./components/Logo";

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  // There is no router here — screens are component state, so each one is
  // reported to GA explicitly. The pool detail screen reports its own tabs.
  const signedIn = !!user;
  const inPoolDetail = !!selectedPool;
  useEffect(() => {
    if (loading || inPoolDetail) return;
    if (signedIn) trackScreenView("/predictor/pools", "Predictor — Pools");
    else trackScreenView("/predictor/login", "Predictor — Sign In");
  }, [loading, signedIn, inPoolDetail]);

  const handleSignOut = async () => {
    await signOut();
    setSelectedPool(null);
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
      <>
        <HostBar />
        <LoginPage />
      </>
    );
  }

  // Signed in layout
  return (
    <div className="min-h-screen bg-[#061217] flex flex-col">
      <HostBar />
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 hover:border-slate-600 transition-colors text-xs font-semibold cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
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
