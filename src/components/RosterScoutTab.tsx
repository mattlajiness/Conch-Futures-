import React, { useState, useEffect } from "react";
import { Search, Sparkles, User, RefreshCw, AlertCircle, ShieldCheck, CheckCircle, HelpCircle } from "lucide-react";
import { FUTURES_QUESTIONS } from "../constants";
import { fetchNflTeams, fetchTeamRoster, NflTeam, NflPlayer } from "../lib/nflApi";

export default function RosterScoutTab() {
  const [teams, setTeams] = useState<NflTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [roster, setRoster] = useState<NflPlayer[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Player lookup cache to avoid repeating fetches
  const [playerCache, setPlayerCache] = useState<Record<string, NflPlayer & { teamAbbrev: string; teamLogo: string }>>({});
  const [loadingPlayerDetail, setLoadingPlayerDetail] = useState<string | null>(null);

  // Extract all unique award players from FUTURES_QUESTIONS
  const awardPlayers = React.useMemo(() => {
    const list: Array<{ value: string; label: string; teamCode: string; awardId: string; awardTitle: string }> = [];
    const seen = new Set<string>();

    FUTURES_QUESTIONS.forEach((q) => {
      if (q.category === "award") {
        q.options.forEach((opt) => {
          if (opt.value === "other") return;
          
          // Try to extract name and team from label: e.g. "Caleb Williams (Bears)"
          const match = opt.label.match(/^([^\(]+)\s*(?:\(([^)]+)\))?$/);
          const name = match ? match[1].trim() : opt.label;
          const teamName = match && match[2] ? match[2].trim() : "";
          
          const uniqueKey = `${opt.value}-${q.id}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            list.push({
              value: opt.value,
              label: name,
              teamCode: teamName,
              awardId: q.id,
              awardTitle: q.title,
            });
          }
        });
      }
    });
    return list;
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    const loadTeams = async () => {
      setLoadingTeams(true);
      try {
        const teamsData = await fetchNflTeams();
        // Sort teams alphabetically
        const sorted = [...teamsData].sort((a, b) => a.displayName.localeCompare(b.displayName));
        setTeams(sorted);
      } catch (err) {
        console.error("Failed to load NFL teams:", err);
      } finally {
        setLoadingTeams(false);
      }
    };
    loadTeams();
  }, []);

  // Fetch roster when team is selected
  useEffect(() => {
    if (!selectedTeamId) {
      setRoster([]);
      return;
    }
    const loadRoster = async () => {
      setLoadingRoster(true);
      try {
        const rosterData = await fetchTeamRoster(selectedTeamId);
        setRoster(rosterData);
      } catch (err) {
        console.error(`Failed to load roster for team ${selectedTeamId}:`, err);
      } finally {
        setLoadingRoster(false);
      }
    };
    loadRoster();
  }, [selectedTeamId]);

  // Dynamically verify a specific candidate's current roster status
  const lookupCandidateStatus = async (player: { value: string; label: string; teamCode: string }) => {
    if (playerCache[player.value]) return;
    
    setLoadingPlayerDetail(player.value);
    try {
      // Find team first from teams list
      const teamsList = teams.length > 0 ? teams : await fetchNflTeams();
      if (teams.length === 0) setTeams(teamsList);
      
      // Let's search all rosters or find which team the player belongs to
      let foundPlayer: NflPlayer | null = null;
      let playerTeam: NflTeam | null = null;

      // Optimistically search player's listed team first!
      const listedTeam = teamsList.find(t => 
        t.displayName.toLowerCase().includes(player.teamCode.toLowerCase()) || 
        t.shortDisplayName.toLowerCase().includes(player.teamCode.toLowerCase()) ||
        t.abbreviation === player.teamCode.toUpperCase()
      );

      if (listedTeam) {
        const rosterData = await fetchTeamRoster(listedTeam.id);
        const match = rosterData.find(p => 
          p.fullName.toLowerCase().replace(/[^a-z]/g, "").includes(player.label.toLowerCase().replace(/[^a-z]/g, "")) ||
          player.label.toLowerCase().replace(/[^a-z]/g, "").includes(p.fullName.toLowerCase().replace(/[^a-z]/g, ""))
        );
        if (match) {
          foundPlayer = match;
          playerTeam = listedTeam;
        }
      }

      // If not found in the listed team, search all teams
      if (!foundPlayer) {
        for (const t of teamsList) {
          // Skip the listed team as we already searched it
          if (listedTeam && t.id === listedTeam.id) continue;
          
          try {
            const rosterData = await fetchTeamRoster(t.id);
            const match = rosterData.find(p => 
              p.fullName.toLowerCase().replace(/[^a-z]/g, "").includes(player.label.toLowerCase().replace(/[^a-z]/g, "")) ||
              player.label.toLowerCase().replace(/[^a-z]/g, "").includes(p.fullName.toLowerCase().replace(/[^a-z]/g, ""))
            );
            if (match) {
              foundPlayer = match;
              playerTeam = t;
              break;
            }
          } catch (e) {
            // Ignore single team fetch error
          }
        }
      }

      if (foundPlayer && playerTeam) {
        setPlayerCache(prev => ({
          ...prev,
          [player.value]: {
            ...foundPlayer!,
            teamAbbrev: playerTeam!.abbreviation,
            teamLogo: playerTeam!.logo
          }
        }));
      } else {
        // Player not found on any active 53-man roster (could be free agent or injured)
        setPlayerCache(prev => ({
          ...prev,
          [player.value]: {
            id: "not_found",
            fullName: player.label,
            shortName: player.label,
            jersey: "--",
            position: "FA/Injured",
            headshot: "https://a.espncdn.com/i/headshots/nophoto.png",
            age: 0,
            experience: 0,
            teamAbbrev: "FREE AGENT / OTHER",
            teamLogo: ""
          }
        }));
      }
    } catch (err) {
      console.error("Player lookup failed:", err);
    } finally {
      setLoadingPlayerDetail(null);
    }
  };

  // Filter roster by search input
  const filteredRoster = roster.filter(player => 
    player.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Search className="text-teal-400 w-5 sm:w-6 h-5 sm:h-6" /> NFL ROSTER & AWARD SCOUT
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Verify official player rosters, current team affiliations, and headshots pulled directly from ESPN's live database.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Side Roster Checker / Right Side Team Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Futures Candidates Verification Panel */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-white text-sm font-bold tracking-tight uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Futures Awards Candidates list
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Click any player below to verify their current active team & retrieve live headshot from ESPN.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
            {awardPlayers.map((player) => {
              const details = playerCache[player.value];
              const isLoading = loadingPlayerDetail === player.value;
              const hasMismatch = details && details.teamAbbrev !== "FREE AGENT / OTHER" && 
                !player.teamCode.toLowerCase().includes(details.teamAbbrev.toLowerCase()) &&
                !details.teamAbbrev.toLowerCase().includes(player.teamCode.toLowerCase().slice(0, 4));

              return (
                <div 
                  key={`${player.value}-${player.awardId}`}
                  onClick={() => lookupCandidateStatus(player)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                    isLoading 
                      ? "bg-slate-800/80 border-slate-700 animate-pulse" 
                      : details 
                        ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800/60" 
                        : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/30"
                  }`}
                >
                  {/* ESPN Player Headshot */}
                  <div className="relative w-11 h-11 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                    {details ? (
                      <img 
                        src={details.headshot} 
                        alt={player.label} 
                        className="w-11 h-11 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    {isLoading && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white text-xs font-bold block truncate group-hover:text-teal-300 transition-colors">
                        {player.label}
                      </span>
                      {details && (
                        <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
                          #{details.jersey || "--"}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-slate-400 block truncate font-mono">
                      Award: <span className="text-amber-400/80">{player.awardTitle.split(" (")[0]}</span>
                    </span>

                    {/* Team Affiliation Status */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        Listed: <span className="text-slate-400 font-black">{player.teamCode}</span>
                      </span>
                      
                      {details && (
                        <>
                          <span className="text-slate-600 text-[9px] font-mono">|</span>
                          <span className={`text-[10px] font-extrabold font-mono flex items-center gap-0.5 px-1 rounded ${
                            hasMismatch 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : details.teamAbbrev === "FREE AGENT / OTHER"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            ESPN: {details.teamAbbrev}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Verification Indicator Icon */}
                  <div className="absolute right-2.5 top-2.5">
                    {details ? (
                      hasMismatch ? (
                        <AlertCircle className="w-4 h-4 text-rose-400" title="Team Discrepancy! Traded?" />
                      ) : details.teamAbbrev === "FREE AGENT / OTHER" ? (
                        <HelpCircle className="w-4 h-4 text-amber-400" title="Player Not Found on Active NFL Roster" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Team Affiliation Confirmed" />
                      )
                    ) : (
                      <span className="text-[8px] font-bold text-slate-600 group-hover:text-teal-400 uppercase font-mono tracking-widest border border-slate-800/80 px-1 py-0.5 rounded transition-colors bg-slate-900/30">
                        Scan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Team Roster Browser Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-inner">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-white text-sm font-bold tracking-tight uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" /> NFL Team Rosters
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Select any of the 32 NFL teams to explore their complete 53-man active roster.</p>
          </div>

          <div className="space-y-4 flex-grow flex flex-col">
            {/* Team Dropdown Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">Select NFL Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={loadingTeams}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-teal-500 transition-colors"
              >
                <option value="">-- Choose Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-950">
                    {t.displayName} ({t.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            {/* Roster Search input */}
            {selectedTeamId && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">Search Team Roster</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player name or position..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-teal-500/20 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Roster List Scroll */}
            <div className="flex-grow overflow-y-auto max-h-[330px] pr-1 space-y-2">
              {loadingRoster ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs font-bold gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                  <span>Loading ESPN Roster...</span>
                </div>
              ) : selectedTeamId ? (
                filteredRoster.length > 0 ? (
                  filteredRoster.map((player) => (
                    <div 
                      key={player.id} 
                      className="p-2.5 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/60 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={player.headshot} 
                          alt={player.fullName} 
                          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-white text-xs font-bold block truncate group-hover:text-teal-400 transition-colors">
                            {player.fullName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono font-black uppercase">
                            Pos: <span className="text-slate-400">{player.position}</span> | Age: <span className="text-slate-400">{player.age}</span> | Exp: <span className="text-slate-400">{player.experience === 0 ? "R" : `${player.experience}yr`}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-black bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        #{player.jersey || "--"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-600 text-xs font-bold">
                    No matching players found on the roster.
                  </div>
                )
              ) : (
                <div className="py-16 text-center text-slate-600 text-xs font-bold flex flex-col items-center justify-center gap-2">
                  <User className="w-6 h-6 text-slate-700" />
                  <span>Choose a team to load their roster.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
