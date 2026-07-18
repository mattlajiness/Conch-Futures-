import fs from 'fs';
import ts from 'typescript';

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
  console.log("Fetching teams...");
  const teams = await fetchNflTeams();
  const allPlayers = [];
  for (const t of teams) {
    console.log(`Fetching roster for ${t.displayName}...`);
    const roster = await fetchTeamRoster(t.id);
    for (const p of roster) {
      allPlayers.push({ name: p.fullName, team: t.displayName, shortTeam: t.name });
    }
  }
  
  let content = fs.readFileSync('src/constants.ts', 'utf-8');
  
  // A simple regex to find options like: { value: "patrick_mahomes", label: "Patrick Mahomes (Chiefs)" }
  // We'll replace the team in the label if we find a match.
  const regex = /\{ value: "[^"]+", label: "([^\(]+) \(([^\)]+)\)" \}/g;
  
  let match;
  let matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      full: match[0],
      name: match[1].trim(),
      team: match[2].trim()
    });
  }
  
  for (const m of matches) {
    // Find player
    const player = allPlayers.find(p => p.name.toLowerCase() === m.name.toLowerCase() || p.name.toLowerCase().includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(p.name.toLowerCase()));
    if (player) {
      if (player.shortTeam !== m.team && player.team !== m.team) {
        console.log(`Updating ${m.name}: ${m.team} -> ${player.shortTeam}`);
        const newLabel = `${m.name} (${player.shortTeam})`;
        const newStr = m.full.replace(`${m.name} (${m.team})`, newLabel);
        content = content.replace(m.full, newStr);
      }
    } else {
      console.log(`Player not found: ${m.name}`);
    }
  }
  
  fs.writeFileSync('src/constants.ts', content);
  console.log("Done.");
}

main();
