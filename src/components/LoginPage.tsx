import React from "react";
import { Trophy, Shield, Heart, Compass, Award } from "lucide-react";
import Logo from "./Logo";

interface LoginPageProps {
  onSignIn: () => void;
}

export default function LoginPage({ onSignIn }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#061217] flex flex-col justify-between relative overflow-hidden">
      <div className="relative z-20 w-full bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 border-b-2 border-purple-400/60 shadow-[0_0_50px_-5px_rgba(168,85,247,0.6)] px-6 py-4 text-center">
        <p className="text-white font-extrabold text-base sm:text-xl tracking-tight font-display">
          peppahjackk's AI says hello to the beach justice
        </p>
      </div>

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
              onClick={onSignIn}
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
