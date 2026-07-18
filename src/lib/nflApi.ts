export interface TeamStandingInfo {
  abbreviation: string;     // e.g., "MIA"
  displayName: string;      // e.g., "Miami Dolphins"
  wins: number;
  losses: number;
  ties: number;
  overallRecord: string;    // e.g., "11-6"
  divisionStanding: number; // 1 to 4
  divisionName: string;     // e.g., "AFC East"
}

/**
 * Fetches real-time NFL standings and team records from ESPN's public API.
 * This API is unauthenticated and open for Cross-Origin (CORS) browser requests.
 */
export async function fetchNflStandings(): Promise<Record<string, TeamStandingInfo>> {
  const response = await fetch("https://site.api.espn.com/apis/v2/sports/football/nfl/standings");
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL standings: ${response.status}`);
  }
  const data = await response.json();
  const standingsMap: Record<string, TeamStandingInfo> = {};

  // ESPN returns: data.children -> conferences (AFC, NFC)
  const conferences = data.children || [];
  for (const conf of conferences) {
    // conf.children -> divisions (AFC East, etc.)
    const divisions = conf.children || [];
    for (const div of divisions) {
      const divName = div.name || ""; // e.g. "AFC East"
      const entries = div.standings?.entries || [];
      
      entries.forEach((entry: any, index: number) => {
        const teamAbbrev = entry.team?.abbreviation?.toUpperCase() || "";
        const displayName = entry.team?.displayName || "";
        
        let wins = 0;
        let losses = 0;
        let ties = 0;
        let overallRecord = "0-0";
        
        const stats = entry.stats || [];
        for (const stat of stats) {
          if (stat.name === "wins") wins = Number(stat.value ?? 0);
          else if (stat.name === "losses") losses = Number(stat.value ?? 0);
          else if (stat.name === "ties") ties = Number(stat.value ?? 0);
          else if (stat.name === "overall") overallRecord = stat.summary || `${wins}-${losses}`;
        }
        
        if (teamAbbrev) {
          standingsMap[teamAbbrev] = {
            abbreviation: teamAbbrev,
            displayName,
            wins,
            losses,
            ties,
            overallRecord,
            divisionStanding: index + 1, // 1, 2, 3, or 4
            divisionName: divName
          };
        }
      });
    }
  }
  
  return standingsMap;
}

export interface NflTeam {
  id: string;
  uid: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  logo: string;
}

export interface NflPlayer {
  id: string;
  fullName: string;
  shortName: string;
  jersey: string;
  position: string;
  headshot: string;
  age: number;
  experience: number;
}

/**
 * Fetches all 32 NFL teams with their metadata from ESPN
 */
export async function fetchNflTeams(): Promise<NflTeam[]> {
  const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams");
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL teams: ${response.status}`);
  }
  const data = await response.json();
  const teamsList: NflTeam[] = [];

  const sports = data.sports || [];
  for (const sport of sports) {
    const leagues = sport.leagues || [];
    for (const league of leagues) {
      const teams = league.teams || [];
      teams.forEach((t: any) => {
        const teamInfo = t.team;
        if (teamInfo) {
          teamsList.push({
            id: teamInfo.id || "",
            uid: teamInfo.uid || "",
            abbreviation: teamInfo.abbreviation?.toUpperCase() || "",
            displayName: teamInfo.displayName || "",
            shortDisplayName: teamInfo.shortDisplayName || "",
            color: teamInfo.color || "000000",
            alternateColor: teamInfo.alternateColor || "ffffff",
            logo: teamInfo.logos?.[0]?.href || ""
          });
        }
      });
    }
  }
  return teamsList;
}

/**
 * Fetches the active roster for an NFL team
 */
export async function fetchTeamRoster(teamId: string): Promise<NflPlayer[]> {
  const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`);
  if (!response.ok) {
    throw new Error(`Failed to fetch roster for team ${teamId}: ${response.status}`);
  }
  const data = await response.json();
  const playersList: NflPlayer[] = [];

  const athletesGroup = data.athletes || [];
  for (const group of athletesGroup) {
    const items = group.items || [];
    items.forEach((item: any) => {
      playersList.push({
        id: item.id || "",
        fullName: item.fullName || "",
        shortName: item.shortName || "",
        jersey: item.jersey || "",
        position: item.position?.abbreviation || "",
        headshot: item.headshot?.href || "https://a.espncdn.com/i/headshots/nophoto.png",
        age: item.age || 0,
        experience: item.experience?.years || 0
      });
    });
  }
  return playersList;
}

