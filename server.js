var http = require('http');
var querystring = require('querystring');
var Q = require('q');

// App brains.
var slackSlash = require('./lib/slackSlash.js');

var port = process.argv[2];
var server = http.createServer(function (request, response) {
  var reqInfoPrefix = request.method+' '+request.url+' : '; // For logging.

  // Haystakt slash commands for Slack.
  // curl -d {} http://localhost:5000/slack/slash
  if (request.method === 'POST' && request.url === '/slack/slash') {
    Q().then(function () {
      var deferred = Q.defer();
      var body = '';
      request.on('data', function (chunk) {body += chunk;});
      request.on('end', function () {
        var data = querystring.parse(body);
        reqInfoPrefix += data.command+' ';
        deferred.resolve(data);
      });
      return deferred.promise;
    }).then(slackSlash).then(
      // Final success.
      function (data) {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(data);
        console.log(reqInfoPrefix+'served.');
      },
      // Final error handler.
      function (err) {
        response.writeHead(400);
        response.end(err.message || err);
        console.log(reqInfoPrefix+'Error: '+(err.message || err));
      }
    );
    
  } else {
    response.writeHead(404);
    response.write('404: Nothing Here.\n');
    response.end();
    console.log(reqInfoPrefix+'Rejected (404).');
  }
});

server.listen(port);
