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

  let content = fs.readFileSync('src/constants.ts', 'utf-8');
  
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
    let searchName = m.name;
    // Don't search coaches
    const coaches = ["Ben Johnson", "Jim Harbaugh", "DeMeco Ryans", "Matt LaFleur", "Dan Campbell", "Mike Macdonald", "Kevin O'Connell", "Shane Steichen", "Raheem Morris", "Mike Tomlin"];
    if (coaches.includes(searchName)) continue;
    
    if (searchName === "Travis Hunter") searchName = "Travis Hunter";
    if (searchName === "Chris Godwin") searchName = "Chris Godwin Jr.";

    const player = allPlayers.find(p => p.name.toLowerCase().includes(searchName.toLowerCase()) || searchName.toLowerCase().includes(p.name.toLowerCase()));
    
    if (player) {
      if (player.shortTeam !== m.team) {
        console.log(`Updating ${m.name} from ${m.team} to ${player.shortTeam}`);
        const newLabel = `${m.name} (${player.shortTeam})`;
        const newStr = m.full.replace(`${m.name} (${m.team})`, newLabel);
        content = content.replace(m.full, newStr);
      }
    } else {
      console.log(`Could not find ${m.name}`);
    }
  }

  fs.writeFileSync('src/constants.ts', content);
}

main();
