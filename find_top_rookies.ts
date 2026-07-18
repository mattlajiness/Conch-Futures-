async function fetchTeamRoster(teamId) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`);
  const data = await res.json();
  const players = [];
  for (const group of data.athletes || []) {
    for (const item of group.items || []) {
      players.push({ ...item, teamId });
    }
  }
  return players;
}

async function fetchTeamDetails() {
  const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams");
  const data = await res.json();
  const teams = {};
  for (const sport of data.sports || []) {
    for (const league of sport.leagues || []) {
      for (const t of league.teams || []) {
        if (t.team) teams[t.team.id] = t.team;
      }
    }
  }
  return teams;
}

async function main() {
  let allPlayers = [];
  for (let i = 1; i <= 34; i++) {
    try {
      const roster = await fetchTeamRoster(i);
      allPlayers = allPlayers.concat(roster);
    } catch(e) {}
  }
  
  const teams = await fetchTeamDetails();
  
  const rookies = allPlayers.filter(p => p.experience && p.experience.years === 0);
  
  const topQBs = rookies.filter(p => p.position.abbreviation === 'QB').slice(0, 15);
  const topRBs = rookies.filter(p => p.position.abbreviation === 'RB').slice(0, 10);
  const topWRs = rookies.filter(p => p.position.abbreviation === 'WR').slice(0, 15);
  const topDef = rookies.filter(p => ['LB', 'DE', 'DT', 'CB', 'S', 'EDGE'].includes(p.position.abbreviation)).slice(0, 30);
  
  console.log("QBs:");
  topQBs.forEach(p => console.log(`${p.fullName} (${teams[p.teamId]?.name || 'Unknown'})`));
  console.log("\nRBs:");
  topRBs.forEach(p => console.log(`${p.fullName} (${teams[p.teamId]?.name || 'Unknown'})`));
  console.log("\nWRs:");
  topWRs.forEach(p => console.log(`${p.fullName} (${teams[p.teamId]?.name || 'Unknown'})`));
  console.log("\nDEF:");
  topDef.forEach(p => console.log(`${p.fullName} - ${p.position.abbreviation} (${teams[p.teamId]?.name || 'Unknown'})`));
}
main();
