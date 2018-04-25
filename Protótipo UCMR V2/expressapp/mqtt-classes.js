var mqtt = require('mqtt');


class HardwareMQTTDebug
{
    constructor()
    {
        var tmpCodigo = this.CriarID();
        this.codigo = tmpCodigo;
        this.ligado = false;
        this.topicos = new Array();

        this.cliente = mqtt.connect('mqtt://localhost', {clientId : this.codigo });

        var pai = this;
        this.cliente.on('connect', function()
        {
            this.subscribe(tmpCodigo);
            console.log("Estou inscrito em: " + tmpCodigo);
            pai.AddTopicos(tmpCodigo);
        });

        this.cliente.on('message', function(topico, mensagem)
        {

            var comandos = mensagem.toString().split("\n");
            if(comandos[0] == 'tp') //tp = toggle power
            {
                pai.estado = (comandos[1] == '1');
            }
            else if(comandos[0] == 'sub') //sub = subscribe
            {
                this.subscribe(comandos[1]);
                pai.AddTopicos(comandos[1]);
            }
            else if(comandos[0] == 'unsub') //unsub = unsubscripe
            {
                this.unsubscribe(comandos[1]);
                pai.SubTopicos(comandos[1]);
            }
            else
            {
                console.log("Mensagem inválida: " + mensagem.toString());
            }
        });

    }

    AddTopicos(topico)
    {
        this.topicos.push(topico);
    }

    SubTopicos(topico)
    {
        var index = this.topicos.indexOf(client);
        if(index != -1)
            this.topicos.splice(index, 1);
    }


    CriarID()
    {
        var id = "";
        var possiveis = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 23; i++) //A maior largura de um id é 23
            id += possiveis.charAt(Math.floor(Math.random() * possiveis.length));

        return id;
    }

    Enviarmensaegm(topico, payload)
    {
        this.cliente.publish(topic, payload);
    }


}


class ClienteMQTT
{
    constructor(hardware)
    {
        this.hardware = hardware;
        this.codigo = hardware.id;
        this.nome = hardware.id;
        this.estado = false;
    }

    //Simplifica os objetos
    ToSimpleOBJ() 
    {
        return {codigo : this.codigo, nome : this.nome, estado : this.estado } 
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

module.exports = {ClienteMQTT : ClienteMQTT, HardwareMQTTDebug : HardwareMQTTDebug};