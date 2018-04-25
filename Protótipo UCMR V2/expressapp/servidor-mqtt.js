var mosca = require('mosca');

class ServidorMQTT
{
    constructor()
    {
        var OpcoesMosca = {
        type: 'redis',
        redis: require('redis'),
        db: 12,
        port: 6379,
        return_buffers: true, // to handle binary payloads
        host: "localhost"
        };
        this.dispositivos = new Array();
        var moscaSettings = {
            port: 1883,			
            backend: OpcoesMosca
        }
        this.server = new mosca.Server(moscaSettings);
        this.server.on('clientConnected', function(client) {
            console.log('client connected', client.id);
            this.dispositivos.push(client);	
        });	
        this.server.on('published', function(packet, client) {
            console.log('Published', packet.payload);

        });
        this.server.on('clientDisconnected', function(client) { 
            var index = this.dispositivos.indexOf(client);
	        this.dispositivos.splice(index, 1);
            console.log('client ' +  client.id+ ' disconnect');
        });
        this.server.on('ready', function()
        {
            console.log("Mosca operacional");
        });
    }

    AdicionarDispositivo(cliente, __callback)
    {
        this.dispositivos.push(cliente);
        console.log(this.dispositivos.length);
        if(typeof(__callback !== 'undefined'))
        {
            __callback();
        }
    }
    get dispostivos()
    {
        return this.dispositivos;
    }
}

module.exports = ServidorMQTT;

