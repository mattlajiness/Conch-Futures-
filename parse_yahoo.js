const https = require('https');
https.get('https://sports.yahoo.com/articles/nfl-coach-odds-vrabel-proves-210900770.html', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // try to find lines with +odds
    const matches = body.match(/([A-Za-z. ]+?)(?:\s+)?\+([0-9]{3,4})/g);
    if (matches) {
       console.log(matches.slice(0, 30));
    } else {
       console.log("No odds format found");
    }
  });
});
