let mqtt = require("mqtt")
const config = require('./../ucmr.config')
const models = require('./DBModels')
class ClienteMQTTDebug
{
    constructor()
    {
        let tmpCodigo = this.CriarID();
        this.codigo = tmpCodigo;
        this.ligado = false;
        this.topicos = new Array();
        this.cliente = mqtt.connect('mqtt://localhost:'+config.mqttport, {clientId : this.codigo, username : config.mqttuser, password : config.mqttpassword});
        let pai = this;
        new models.LogEventos({tempo : new Date(), evento : "Dispositivo debug " +this.codigo+ " Adicionado", tipo : 1}).save();
        this.cliente.on('connect', function()
        {
            this.subscribe(tmpCodigo);
        });

        this.cliente.on('message', function(topico, mensagem)
        {
            let comandos = mensagem.toString().split("\n");

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
        let id = "debug_";
        let possiveis = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < 17; i++) //A maior largura de um id é 23
            id += possiveis.charAt(Math.floor(Math.random() * possiveis.length));

        return id;
    }
}

module.exports = ClienteMQTTDebug
