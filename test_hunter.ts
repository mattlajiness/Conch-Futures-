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
  const hunter = allPlayers.find(p => p.fullName === "Travis Hunter");
  console.log("Travis Hunter exp:", hunter?.experience);
  const sanders = allPlayers.find(p => p.fullName === "Shedeur Sanders");
  console.log("Shedeur Sanders exp:", sanders?.experience);
  const ewers = allPlayers.find(p => p.fullName === "Quinn Ewers");
  console.log("Quinn Ewers exp:", ewers?.experience);
}
main();
