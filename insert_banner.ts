import fs from 'fs';

let content = fs.readFileSync('src/components/PoolDetail.tsx', 'utf8');

const bannerHtml = `
      {activeTab === "standings" && !isPicksComplete && (
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-4 mb-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-emerald-400 font-extrabold text-lg flex items-center gap-2 mb-1">
              <Timer className="w-5 h-5" /> 
              Make Your Predictions!
            </h3>
            <p className="text-emerald-100/70 text-sm max-w-xl">
              You've completed <strong className="text-emerald-300">{completedPicksCount}</strong> of <strong className="text-emerald-300">{totalQuestions}</strong> picks. Lock in your predictions for division winners, the Super Bowl, and major awards before kickoff!
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
`;

content = content.replace('{activeTab !== "picks" && (', bannerHtml + '\n      {activeTab !== "my_picks" && activeTab !== "admin" && activeTab !== "last_year" && (');

fs.writeFileSync('src/components/PoolDetail.tsx', content);
console.log("Banner inserted successfully.");
