var mosca = require('mosca');
var mqtt = require('mqtt');
var LogEventos = require('./db/LogEventos');
var ModeloDispositivo = require('./db/Dispositivo');
var portMQTT;
var usuariodebug;
var senhadebug;


class ServidorMQTT
{
    constructor(portamqtt, mongo, iosocket, mqttusuario, mqttsenha)
    {
        portMQTT = portamqtt;
        this.socket = iosocket;
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
        this.autenticar = function(cliente, usuario, senha, callback)
        {
            var autorizado = (usuario == mqttusuario && senha == mqttsenha);
            callback(null, autorizado);
        }
        this.autorizarPublicacao = function(cliente, topico, payload, callback)
        {
            var split = topico.split('/');
            callback(null, split[0] == cliente.id);
        }
        this.autorizarInscricao = function(cliente, topico, callback)
        {
            var split = topico.split('/');
            callback(null, split[0] == cliente.id);
        }
        usuariodebug = mqttusuario;
        senhadebug = mqttsenha;
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
                new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " conectado", tipo : 1}).save();
                var msg =  pai.GetSimpleDisp();
                pai.socket.Emitir("update sonoff", msg);
                pai.socket.Emitir("topicos updated", msg);
            });
            
        });	
        this.server.on('published', function(packet, client) {
            if(typeof(client) !== 'undefined')
            {
                var mensagem = packet.payload.toString();
                var topico = packet.topic.toString();
                new LogEventos({tempo : new Date(), evento : "Cliente " +  client.id + " publicou " + mensagem + " para " + topico, tipo : 1}).save();
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
                                if(dispositivo.topicos.length > 0)
                                {
                                    let mensagem = "sub\n";
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
                                }
                                
                                pai.PublicarMensagem(parse[0], "sts\n1");
                            });
                        }
                    }
                    else if(parse[1] == 'ligado')
                    {
                        var novoestado = (mensagem == "1") ? true : false;
                        disp.estado = novoestado;
                        var codigos = new Array();
                        codigos.push(parse[0]);
                        var mensagem = {codigos : codigos, valor : novoestado};

                        pai.socket.Emitir('att estado sonoff', mensagem); 
                    }

                }
                catch(err) {}

            }
            
        });
        this.server.on('clientDisconnected', function(client) { 
            new LogEventos({tempo : new Date(), evento : "Dispositivo " +  client.id + " desconectado", tipo : 1}).save();
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
                var msg =  pai.GetSimpleDisp();
                pai.socket.Emitir("update sonoff", msg);
                pai.socket.Emitir("topicos updated", msg);
                console.log('Cliente ' +  client.id + ' desconectou');
            });
           
        });
        this.server.on('ready', function()
        {
            console.log("Servidor MQTT operacional");
            this.authenticate = pai.autenticar;
            this.authorizePublish = pai.autorizarPublicacao;
            this.authorizeSubscribe = pai.autorizarInscricao;
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
        new LogEventos({tempo : new Date(), evento : "Mensagem "+payload+" enviada pelo servidor para "+topico, tipo : 1}).save();
    }

    InscreverTopico(codigoDisp, topico, __callback)
    {   
        var pai = this;
        ModeloDispositivo.findOne({idDispositivo : codigoDisp}, function(err, disp)
        {
            if(err) 
            {
                __callback(err);
            }
            else if(disp != null)
            {
                if(disp.topicos.length > 5)
                {
                    __callback("O número máximo de tópicos para um dispositivo é 5");
                    return;
                }

                for(var i = 0; i < disp.topicos.length; i++)
                {
                    if(disp.topicos[i] == topico)
                    {
                        __callback("Dispositivo já inscrito no tópico " + topico);
                        return;
                    }
                }

                try
                {
                    var local = pai.GetDispositivo(codigo);
                    local.topicos.push(topico);
                }
                catch(e){}

                pai.PublicarMensagem(codigoDisp, "sub\n"+topico);
                disp.topicos.push(topico);
                disp.save();
                __callback(null);
            }
            else
            {
                __callback("Dispositivo não encontrado");
            }
        });
    }
    DesinscreverTopico(codigoDisp, topico, __callback)
    {
        topico = topico.toLowerCase();
        var pai = this;
        ModeloDispositivo.findOne({idDispositivo : codigoDisp}, function(err, disp)
        {

            if(err) 
            {
                __callback(err);
            }
            else if(disp != null)
            {
                try
                {
                    var local = pai.GetDispositivo(codigo);
                    local.SubTopicos(topico);
                }
                catch(e){}

                pai.PublicarMensagem(codigoDisp, "unsub\n"+topico);
                var index = disp.topicos.indexOf(topico);  
                if(index != -1)
                    disp.topicos.splice(index, 1);
                disp.save();
                __callback(null);
            }
            else
            {
                __callback("Dispositivo não encontrado");
            }
        });
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
    GetDispInTopico(topico)
    {
        topico = topico.toLowerCase();
        var retorno = new Array();
        
        for(var i = 0; i < this.dispositivos.length; i++)
        {
            for(var j = 0; j < this.dispositivos[i].topicos.length; j++)
            {
                if(this.dispositivos[i].topicos[j].toLowerCase() == topico)
                {
                    retorno.push(this.dispositivos[i].ToSimpleOBJ());
                    break;
                }
            }
        }
        return retorno;
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
        this.cliente = mqtt.connect('mqtt://localhost:'+portMQTT, {clientId : this.codigo, username : usuariodebug, password : senhadebug});
        var pai = this;
        new LogEventos({tempo : new Date(), evento : "Dispositivo debug " +this.codigo+ " Adicionado", tipo : 1}).save();
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
        if(this.topicos.length > 5)
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
            new LogEventos({tempo : new Date(), evento : "Dispositivo " +this.codigo+ " renomeado de "+this.nome+" para " + nome, tipo : 1}).save();
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


