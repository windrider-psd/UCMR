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
    constructor(hardware)
    {
        this.hardware = hardware;
        this.codigo = hardware.id;
        this.nome = hardware.id;
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

module.exports = {ClienteMQTT : ClienteMQTT, HardwareMQTTDebug : HardwareMQTTDebug};