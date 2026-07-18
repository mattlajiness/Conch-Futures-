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
async function fetchTeamDetails() {
  const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams");
  const data = await res.json();
  const teams = {};
  for (const sport of data.sports || []) {
    for (const league of sport.leagues || []) {
      for (const t of league.teams || []) {
        if (t.team) teams[t.team.id] = t.team;
      }
    }
  }
  return teams;
}
async function main() {
  let allPlayers = [];
  for (let i = 1; i <= 34; i++) {
    try {
      const roster = await fetchTeamRoster(i);
      allPlayers = allPlayers.concat(roster);
    } catch(e) {}
  }
  const teams = await fetchTeamDetails();
  const names = [
    "Arch Manning", "Nico Iamaleava", "Jeremiah Smith", "Zachariah Branch",
    "Jackson Arnold", "Eugene Wilson III", "Carnell Tate", "Jordan Davison",
    "Dylan Stewart", "Caleb Downs", "Harold Perkins", "Bear Alexander",
    "Sonny Styles", "Walter Nolen", "TJ Parker", "Davison Igbinosun"
  ];
  for (const name of names) {
    const p = allPlayers.find(p => p.fullName.includes(name));
    if (p) {
      console.log(`${name}: ${teams[p.teamId]?.name || 'Unknown'}`);
    } else {
      console.log(`${name}: NOT FOUND`);
    }
  }
}
main();
