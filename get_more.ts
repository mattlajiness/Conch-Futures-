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

  const list = [
    "CeeDee Lamb", "Ja'Marr Chase", "Amon-Ra St. Brown", "Breece Hall", "Bijan Robinson", "Saquon Barkley", "Jahmyr Gibbs", "Kyren Williams",
    "Patrick Mahomes", "Josh Allen", "C.J. Stroud", "Joe Burrow", "Lamar Jackson", "Jordan Love", "Justin Herbert", "Brock Purdy", "Jalen Hurts", "Jared Goff", "Caleb Williams"
  ];

  for (const r of list) {
    let s = r.replace("C.J.", "C.J.");
    const player = allPlayers.find(p => p.name.toLowerCase().includes(s.toLowerCase()));
    if (player) {
      console.log(`Found ${player.name} on ${player.shortTeam}`);
    } else {
      console.log(`Could not find ${r}`);
    }
  }
}
main();
