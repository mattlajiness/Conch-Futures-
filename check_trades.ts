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

  const names = ["Tua Tagovailoa", "Justin Jefferson", "A.J. Brown", "Micah Parsons", "Myles Garrett", "Sauce Gardner"];
  
  for (const n of names) {
      console.log(n, ":");
      console.log(allPlayers.filter(p => p.name.includes(n) || n.includes(p.name)).map(p => `${p.name} - ${p.shortTeam}`));
  }
}
main();
