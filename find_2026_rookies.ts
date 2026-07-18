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

async function main() {
  let allPlayers = [];
  for (let i = 1; i <= 34; i++) {
    try {
      const roster = await fetchTeamRoster(i);
      allPlayers = allPlayers.concat(roster);
    } catch(e) {}
  }
  
  const rookies = allPlayers.filter(p => p.experience && p.experience.years === 0);
  console.log("Rookies found:", rookies.length);
  // Let's print some top rookies (maybe by draft pick if available, otherwise just print names)
  console.log(rookies.map(p => `${p.fullName} - ${p.position.abbreviation}`).slice(0, 30));
}
main();
