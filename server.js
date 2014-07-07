var http = require('http');

// App brains.
var slackSlash = require('./lib/slackSlash.js');

var port = process.argv[2];
var server = http.createServer(function (request, response) {
  var reqInfoPrefix = request.method+' '+request.url+' : '; // For logging.

  // Haystakt slash commands for Slack.
  // curl -d {} http://localhost:5000/slack/slash
  if (request.method === 'POST' && request.url === '/slack/slash') {
    // Logic goes here.
    response.writeHead(200);
    response.end();
    console.log(reqInfoPrefix+'Accepted.');
  } else {
    response.writeHead(404);
    response.write('404: Nothing Here.\n');
    response.end();
    console.log(reqInfoPrefix+'Rejected (404).');
  }
});

server.listen(port);
