var mosca = require('mosca');
var mqtt = require('mqtt');
var mqttClasses = require('./mqtt-classes.js')

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

        var pai = this;
        this.server = new mosca.Server(moscaSettings);
        this.server.on('clientConnected', function(client) 
        {
            console.log('Cliente conectado', client.id);
            if(client.id != "mqtt_master")
                pai.AddDispositivo(new mqttClasses.ClienteMQTT(client));	
        });	
        this.server.on('published', function(packet, client) {
            console.log('Publicado: ', packet.payload.toString());
        });
        this.server.on('clientDisconnected', function(client) { 
            pai.SubDispositivo(client);
            console.log('Cliente ' +  client.id+ ' desconectou');
        });
        this.server.on('ready', function()
        {
            console.log("Mosca operacional");
            pai.clienteMaster = mqtt.connect('mqtt://localhost', {clientId : 'mqtt_master'});
        });
    }

    //Apenas usar para debug
    AdicionarDispositivo(cliente, __callback) 
    {
        this.dispositivos.push(cliente);
        console.log(this.dispositivos.length);
        if(typeof(__callback !== 'undefined'))
        {
            __callback();
        }
    }

    AddDispositivo(dispositivo)
    {
        this.dispositivos.push(dispositivo);
    }

    SubDispositivo(dispositivo)
    {
        var index = this.dispositivo.indexOf(dispositivo);
        if(index != -1)
            this.dispositivos.splice(index, 1);
    }

    GetSimpleDisp()
    {
        var retorno = new Array();
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            retorno.push(this.dispositivos[i].ToSimpleOBJ());
        }    
        return retorno;
    }
}

module.exports = ServidorMQTT;

