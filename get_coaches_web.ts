import fs from 'fs';

async function fetchTeamCoaches() {
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

  for (const t of teams) {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${t.id}`);
      const data = await res.json();
      console.log(`${t.displayName}: `)
      // I don't know the exact structure so let's log the coach if it exists
      // Wait, is there a coach field or headCoach field?
  }
}
fetchTeamCoaches();
