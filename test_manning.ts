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
  console.log(allPlayers.filter(p => p.fullName.includes("Arch Manning") || p.fullName.includes("Nico Iamaleava") || p.fullName.includes("Jeremiah Smith")));
}
main();
