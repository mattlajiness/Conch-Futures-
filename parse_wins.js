const https = require('https');

https.get('https://www.vegasinsider.com/nfl/odds/win-totals/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
     console.log(body.substring(0, 500));
  });
});
