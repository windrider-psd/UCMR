var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res)
{
	console.log("Request was made: " + req.url);
	res.writeHead(200, {"Content-Type" : "application/json"});
	var myReadStream = fs.createReadStream(__dirname + '/index.json', 'utf8');
	myReadStream.pipe(res);
});

server.listen(3001, 'localhost');
