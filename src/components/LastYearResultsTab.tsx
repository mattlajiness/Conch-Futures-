import React, { useState } from "react";
import { History, Award, Trophy, Shield } from "lucide-react";
import { NFL_TEAMS_ALL } from "../constants";

const LAST_YEAR_RESULTS = [
  {
    category: "Super Bowl Winner",
    winner: "Seattle Seahawks",
    teamCode: "SEA"
  },
  {
    category: "AFC Champion",
    winner: "New England Patriots",
    teamCode: "NE"
  },
  {
    category: "NFC Champion",
    winner: "Seattle Seahawks",
    teamCode: "SEA"
  },
  {
    category: "NFL MVP",
    winner: "Matthew Stafford",
    teamCode: "LAR"
  },
  {
    category: "Offensive Player of the Year",
    winner: "Jaxon Smith-Njigba",
    teamCode: "SEA"
  },
  {
    category: "Defensive Player of the Year",
    winner: "Myles Garrett",
    teamCode: "CLE"
  },
  {
    category: "Offensive Rookie of the Year",
    winner: "Tetairoa McMillan",
    teamCode: "CAR"
  },
  {
    category: "Defensive Rookie of the Year",
    winner: "Carson Schwesinger",
    teamCode: "CLE"
  },
  {
    category: "Comeback Player of the Year",
    winner: "Christian McCaffrey",
    teamCode: "SF"
  },
  {
    category: "Coach of the Year",
    winner: "Mike Vrabel",
    teamCode: "NE"
  },
  {
    category: "AFC East Champion",
    winner: "New England Patriots",
    teamCode: "NE"
  },
  {
    category: "AFC North Champion",
    winner: "Pittsburgh Steelers",
    teamCode: "PIT"
  },
  {
    category: "AFC South Champion",
    winner: "Jacksonville Jaguars",
    teamCode: "JAX"
  },
  {
    category: "AFC West Champion",
    winner: "Denver Broncos",
    teamCode: "DEN"
  },
  {
    category: "NFC East Champion",
    winner: "Philadelphia Eagles",
    teamCode: "PHI"
  },
  {
    category: "NFC North Champion",
    winner: "Chicago Bears",
    teamCode: "CHI"
  },
  {
    category: "NFC South Champion",
    winner: "Carolina Panthers",
    teamCode: "CAR"
  },
  {
    category: "NFC West Champion",
    winner: "Seattle Seahawks",
    teamCode: "SEA"
  }
];

export default function LastYearResultsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 border border-slate-700/60 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <History className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Last Year's Results</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
            Review the official winners from the previous season to help inform your picks for the upcoming year.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LAST_YEAR_RESULTS.map((result, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-slate-800 rounded-full border border-slate-700/50 flex items-center justify-center flex-shrink-0">
              {result.teamCode ? (
                <img 
                  src={`https://a.espncdn.com/i/teamlogos/nfl/500/${result.teamCode.toLowerCase()}.png`} 
                  alt={result.teamCode} 
                  className="w-8 h-8 object-contain" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <Trophy className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                {result.category}
              </p>
              <p className="text-white font-bold text-sm">
                {result.winner}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
