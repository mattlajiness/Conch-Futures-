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

async function fetchTeamCoaches(teamId) {
  // the coaches are not in the roster, they might be in the team info or we can just fetch from an endpoint.
  // Actually ESPN core team endpoint has coaches sometimes.
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}`);
  const data = await res.json();
  // Sometimes in data.team.franchise or athletes?
  // Let's just log keys
  return data.team;
}

async function main() {
  const teams = await fetchNflTeams();
  const team = await fetchTeamCoaches(teams[0].id);
  console.log(Object.keys(team));
  // Let's dump the whole object
  fs.writeFileSync('team_example.json', JSON.stringify(team, null, 2));
}

main();
