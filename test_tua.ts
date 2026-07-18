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
  const falcons = await fetchTeamRoster('1'); // ATL is 1
  console.log(falcons.filter(p => p.fullName.includes("Tua")));
  const dolphins = await fetchTeamRoster('15'); // MIA is 15
  console.log(dolphins.filter(p => p.fullName.includes("Tua")));
}
main();
