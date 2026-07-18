import fs from 'fs';

async function fetchNflTeams() {
  const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams");
  const data = await res.json();
  const teams = [];
  for (const sport of data.sports || []) {
    for (const league of sport.leagues || []) {
      for (const t of league.teams || []) {
        if (t.team) teams.push(t.team);
      }
    }
  }
  return teams;
}

async function fetchTeamRoster(teamId) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`);
  const data = await res.json();
  const players = [];
  for (const group of data.athletes || []) {
    for (const item of group.items || []) {
      players.push(item);
    }
  }
  return players;
}

async function main() {
  const teams = await fetchNflTeams();
  const allPlayers = [];
  for (const t of teams) {
    const roster = await fetchTeamRoster(t.id);
    for (const p of roster) {
      allPlayers.push({ name: p.fullName, team: t.displayName, shortTeam: t.name });
    }
  }
  
  const h = allPlayers.find(p => p.name.includes("Nacua"));
  const a = allPlayers.find(p => p.name.includes("Rodgers"));
  
  console.log("Nacua:", allPlayers.filter(p => p.name.includes("Nacua")).map(p => `${p.name} - ${p.shortTeam}`));
  console.log("Rodgers:", allPlayers.filter(p => p.name.includes("Rodgers")).map(p => `${p.name} - ${p.shortTeam}`));
}
main();
