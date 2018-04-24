var mosca = require('mosca')
var http = require('http');
var fs = require('fs');
const JSON = require('circular-json');


var clientes = new Array();

var OpcoesMosca = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  return_buffers: true, // to handle binary payloads
  host: "localhost"
};

var moscaSettings = {
  port: 1883,			
  backend: OpcoesMosca
}

var servidorHttp = http.createServer(function(req, res)
{
	console.log("Request was made: " + req.url);
	res.writeHead(200, {"Content-Type" : "application/json"});
	var toJsonObject = new Array();
	for(var i = 0; i < clientes.length; i++)
	{
		toJsonObject.push(clientes[i].id);
	}

	var jsonString = JSON.stringify(toJsonObject);
	res.write(jsonString)
	res.end();
	//myReadStream.pipe(res);
});

servidorHttp.listen(3001, 'localhost');


var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
	console.log('client connected', client.id);
	clientes.push(client);

	http.get('http://localhost:3001', (resp) => {
	  let data = '';
	 
	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
	    data += chunk;
	  });
	 
	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
	    //console.log("retorno: " + JSON.parse(data).explanation);
	    console.log("retorno: " + data);
	  });
	 
	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	});		
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.payload);
});

server.on('clientDisconnected', function(client) {
	var index = clientes.indexOf(client);
	clientes.splice(index, 1);
    console.log('client ' +  client.id+ ' disconnect');
});
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
}


