var mosca = require('mosca');
var mqtt = require('mqtt');
var LogEventos = require('./db/LogEventos');
var ModeloDispositivo = require('./db/Dispositivo');
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
            ModeloDispositivo.findOne({idDispositivo : client.id}, function(err, dispositivo)
            {
                
                var nome = pai.novoDispositivoPrefixo + pai.dispositivosContagem;
                if(err) throw err;
                
                else if(!dispositivo)
                {
                    var debug = (client.id.indexOf("debug_") != -1) ? true : false;
                    var salvar = new ModeloDispositivo({idDispositivo : client.id, topicos : new Array(), nome : nome, debug : debug});
                    salvar.save();
                    pai.AddDispositivo(new ClienteMQTT(client, nome));
                }
                else
                {
                    var disp = new ClienteMQTT(client, dispositivo.nome);
                    for(var i = 0; i < dispositivo.topicos.length; i++)
                    {
                        disp.AddTopicos(dispositivo.topicos[i]);
                    }
                    pai.AddDispositivo(disp);
                }
                pai.dispositivosContagem++;
                new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " conectado"}).save();
            });
            
            
                
        });	
        this.server.on('published', function(packet, client) {
            if(typeof(client) !== 'undefined')
            {
                var mensagem = packet.payload.toString();
                var topico = packet.topic.toString();
                new LogEventos({tempo : new Date(), evento : "Cliente " +  client.id + " publicou " + mensagem + " para " + topico}).save();
                console.log('Publicado: ', mensagem);

                var parse = topico.split('/');
                try
                {
                    var disp = pai.GetDispositivo(parse[0]);
                    if(parse[1] == 'status')
                    {
                        if(disp.status != mensagem)
                        {
                            ModeloDispositivo.findOne({idDispositivo : parse[0]}, function(err, dispositivo)
                            {
                                var mensagem = "sub\n";
                                for(var i = 0; i < dispositivo.topicos.length; i++)
                                {
                                    disp.AddTopicos(dispositivo.topicos[i]);
                                    mensagem += dispositivo.topicos[i];
                                    if(typeof(dispositivo.topicos[i + 1]) !== 'undefined')
                                    {
                                        mensagem += '\r';
                                    }
                                }
                                
                                pai.PublicarMensagem(parse[0], mensagem);
                                pai.PublicarMensagem(parse[0], "sts\n1");
                            });
                            
                        }
                    }

                }
                catch(err) {}

            }
            
        });
        this.server.on('clientDisconnected', function(client) { 
            new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " desconectado"}).save();
            ModeloDispositivo.findOne({idDispositivo : client.id}, function(err, resultado)
            {
                if(err) throw err;
                if(resultado)
                {
                    var disp = pai.GetDispositivo(client.id);
                    resultado.topicos = disp.topicos;
                    resultado.save();
                }
                pai.SubDispositivo(client);
                console.log('Cliente ' +  client.id + ' desconectou');
            });
           
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
                //Verificar isto. Talvez colocar a adição de topico no modelo dentro de AddTopicos
                if(this.dispositivos[i].AddTopicos(topico))
                {
                    var pai = this;
                    ModeloDispositivo.findOne({idDispositivo : codigoDisp}, function(err, disp)
                    {
                        if(err) 
                        {
                            this.dispositivos[i].SubTopicos(topico);
                            throw err;
                        }
                        else
                        {
                            pai.PublicarMensagem(codigoDisp, "sub\n"+topico);
                            disp.topicos.push(topico);
                            disp.save();
                        }
                    });
                }
                    
                else
                    throw "Dispositivo já inscrito no tópico '" + topico + "' ou está inscrito em 5 tópicos";
                
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
                var pai = this;
                this.PublicarMensagem(codigoDisp, "unsub\n"+topico);
                this.dispositivos[i].SubTopicos(topico);
                ModeloDispositivo.findOne({idDispositivo : codigoDisp}, function(err, disp)
                {
                    if(err) 
                    {
                        this.dispositivos[i].AddTopicos(topico);
                        pai.PublicarMensagem(codigoDisp, "sub\n"+topico);
                        throw err;
                    }
                    else
                    {
                        var index = disp.topicos.indexOf(topico);  
                        if(index != -1)
                            disp.topicos.splice(index, 1);
                        disp.save();
                    }
                });
                return;
            }
        }
        throw new Error("Dispositivo não encontrado");
    }

    //Apenas usar para debug
    AdicionarDispositivo(cliente, __callback) 
    {
        this.dispositivos.push(cliente);
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
        var id = "debug_";
        var possiveis = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 17; i++) //A maior largura de um id é 23
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
        this.status = '1';
    }

    //Simplifica os objetos
    ToSimpleOBJ() 
    {
        return {codigo : this.codigo, nome : this.nome, estado : this.estado, topicos : this.topicos } 
    }

    
    AddTopicos(topico)
    {
        topico = topico.toLowerCase();
        if(this.topicos.length >= 5)
            return false;
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
        if(this.nome != nome)
        {
            new LogEventos({tempo : new Date(), evento : "Dispositivo " +this.codigo+ " renomeado de "+this.nome+" para " + nome}).save();
            ModeloDispositivo.findOne({idDispositivo : this.codigo}, function(err, resultado)
            {
                if(err) throw err;
                resultado.nome = nome;
                resultado.save();
            });
            this.nome = nome;
        }
        
        
    }
    set Estado(estado)
    {
        this.estado = estado;
    }
      
}

module.exports = {ServidorMQTT : ServidorMQTT, ClienteMQTT : ClienteMQTT, HardwareMQTTDebug : HardwareMQTTDebug};


