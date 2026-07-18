async function main() {
  const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/odds");
  if (res.ok) {
      console.log(await res.json());
  } else {
      console.log("Not found");
  }
}
main();
