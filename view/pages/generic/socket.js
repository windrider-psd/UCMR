let io = require('socket.io-client')
let observer = require('./observer')

observer.Observar('server-data-ready', (serverdata)=>{
    var socket = io.connect(serverdata.enderecoIP + ":" + serverdata.ioPort);
    socket.on('connect', function ()
	{
		observer.Trigger('socket-ready', socket)
	});
})	

