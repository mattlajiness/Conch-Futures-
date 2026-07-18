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

  const rookiesToFind = [
    "Travis Hunter",
    "Shedeur Sanders",
    "Ashton Jeanty",
    "Cam Ward",
    "Tetairoa McMillan",
    "Luther Burden",
    "Quinn Ewers",
    "Jalen Milroe",
    "Ollie Gordon",
    "Quinshon Judkins",
    "Abdul Carter",
    "Will Johnson",
    "Mason Graham",
    "James Pearce",
    "Nic Scourton",
    "Malaki Starks",
    "Benjamin Morrison",
    "Kenneth Grant",
    "Mykel Williams"
  ];
  
  for (const r of rookiesToFind) {
    const player = allPlayers.find(p => p.name.toLowerCase().includes(r.toLowerCase()));
    if (player) {
      console.log(`Found ${player.name} on ${player.shortTeam}`);
    } else {
      console.log(`Could not find ${r}`);
    }
  }
}

main();
