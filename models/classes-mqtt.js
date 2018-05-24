var mosca = require('mosca');
var mqtt = require('mqtt');
var LogEventos = require('./db/LogEventos');
var portMQTT;
class ServidorMQTT
{
    constructor(portamqtt, mongo)
    {
        portMQTT = portamqtt;
        this.dispositivosContagem = 1;
        this.novoDispositivoPrefixo = "dispositivo ";
        var OpcoesMosca = {
            type: 'mongo',		
            url: mongo,
            pubsubCollection: 'ascoltatori',
            mongo: {}
          };
        this.dispositivos = new Array();
        var moscaSettings = {
            port: portamqtt,			
            backend: OpcoesMosca
        }

        var pai = this;
        this.server = new mosca.Server(moscaSettings);
        this.server.on('clientConnected', function(client) 
        {
            console.log('Cliente conectado', client.id);
            if(client.id != "mqtt_master")
            {
                pai.AddDispositivo(new ClienteMQTT(client, pai.novoDispositivoPrefixo + pai.dispositivosContagem));
                new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " conectado"}).save();
                pai.dispositivosContagem++;
            }
                
        });	
        this.server.on('published', function(packet, client) {
            if(typeof(client) !== 'undefined')
            {
                new LogEventos({tempo : new Date(), evento : "Cliente " +  client.id + " publicou " + packet.payload.toString() + " para " + packet.topic.toString()}).save();
                console.log('Publicado: ', packet.payload.toString());
            }
            
        });
        this.server.on('clientDisconnected', function(client) { 
            pai.SubDispositivo(client);
            new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " desconectado"}).save();
            console.log('Cliente ' +  client.id + ' desconectou');
        });
        this.server.on('ready', function()
        {
            console.log("Servidor MQTT operacional");
        });
    }

    PublicarMensagem(topico, payload)
    {
        var message = {
            topic: topico,
            payload: payload, 
            qos: 1,
            retain: false 
          };
          
        this.server.publish(message);
        new LogEventos({tempo : new Date(), evento : "Mensagem "+payload+" enviada pelo servidor para "+topico}).save();
    }


    InscreverTopico(codigoDisp, topico)
    {   
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            if(topico.toLowerCase() == this.dispositivos[i].codigo.toLowerCase())
            {
                throw "Tópicos não podem ser codigos de dispositivos";
            }
        }
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            if(this.dispositivos[i].codigo == codigoDisp)
            {
                if(this.dispositivos[i].AddTopicos(topico))
                    this.PublicarMensagem(codigoDisp, "sub\n"+topico);
                else
                    throw "Dispositivo já inscrito no tópico '" + topico + "'";
                
                return;
            }
        }
        throw "Dispositivo não encontrado";
    }
    DesinscreverTopico(codigoDisp, topico)
    {
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            if(this.dispositivos[i].codigo == codigoDisp)
            {
                this.PublicarMensagem(codigoDisp, "unsub\n"+topico);
                this.dispositivos[i].SubTopicos(topico);
                return;
            }
        }
        throw new Error("Dispositivo não encontrado");
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
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            if(dispositivo == this.dispositivos[i].hardware)
            {
                this.dispositivos.splice(i, 1);
                break;
            }
        }
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
    GetDispositivo(codigo)
    {
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            if(this.dispositivos[i].codigo == codigo)
                return this.dispositivos[i];
        }
        throw new Error("Dispositivo não encontrado");
    }

    SetEstadoDispTopico(topico, estado)
    {
        topico = topico.toLowerCase();
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            for(var j = 0; j < this.dispositivos[i].topicos.length; j++)
            {
                if(this.dispositivos[i].topicos[j].toLowerCase() == topico)
                {
                    this.dispositivos[i].estado = estado;
                    break;
                }
            }
        }
    }

}

class HardwareMQTTDebug
{
    constructor()
    {
        var tmpCodigo = this.CriarID();
        this.codigo = tmpCodigo;
        this.ligado = false;
        this.topicos = new Array();
        this.cliente = mqtt.connect('mqtt://localhost:'+portMQTT, {clientId : this.codigo });
        var pai = this;
        new LogEventos({tempo : new Date(), evento : "Dispositivo debug " +this.codigo+ " Adicionado"}).save();
        this.cliente.on('connect', function()
        {
            this.subscribe(tmpCodigo);
        });

        this.cliente.on('message', function(topico, mensagem)
        {
            var comandos = mensagem.toString().split("\n");
            console.log("mensagem recebida");
            if(comandos[0] == 'tp') //tp = toggle power
            {
                pai.estado = (comandos[1] == '1');
            }
            else if(comandos[0] == 'sub') //sub = inscrever
            {
                this.subscribe(comandos[1]);
            }
            else if(comandos[0] == 'unsub') //unsub = desinscrever
            {
                this.unsubscribe(comandos[1]);
            }
            else if(comandos[0] == 'end')
            {
                this.end();
            }
            else
            {
                console.log("Mensagem inválida: " + mensagem.toString());
            }
        });
    }

    CriarID()
    {
        var id = "";
        var possiveis = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 23; i++) //A maior largura de um id é 23
            id += possiveis.charAt(Math.floor(Math.random() * possiveis.length));

        return id;
    }


}


class ClienteMQTT
{
    constructor(hardware, nome)
    {
        this.hardware = hardware;
        this.codigo = hardware.id;
        this.nome = nome;
        this.estado = false;
        this.topicos = new Array();
    }

    //Simplifica os objetos
    ToSimpleOBJ() 
    {
        return {codigo : this.codigo, nome : this.nome, estado : this.estado, topicos : this.topicos } 
    }

    
    AddTopicos(topico)
    {
        topico = topico.toLowerCase();
        for(var i = 0; i < this.topicos.length; i++)
        {
            if(this.topicos[i] == topico)
            {
                return false;
            }
        }

        this.topicos.push(topico);
        return true;
    }

    SubTopicos(topico)
    {
        var index = this.topicos.indexOf(topico);  
        if(index != -1)
            this.topicos.splice(index, 1);
    }

    get Codigo()
    {
        return this.codigo;
    }

    get Nome()
    {
        return this.nome;
    }

    set Nome(nome)
    {
        this.nome = nome;
    }
    set Estado(estado)
    {
        this.estado = estado;
    }
      
}

module.exports = {ServidorMQTT : ServidorMQTT, ClienteMQTT : ClienteMQTT, HardwareMQTTDebug : HardwareMQTTDebug};


