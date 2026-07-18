const https = require('https');

https.get('https://www.vegasinsider.com/nfl/odds/awards/', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    // Look for JSON data injected in the page
    const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      console.log(Object.keys(json.props.pageProps));
    } else {
        console.log("No next data found");
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
