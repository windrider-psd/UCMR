var mqtt = require('mqtt');

class ClienteMQTT
{
    constructor(codigo, nome, estado)
    {
        this.codigo = codigo;
        this.nome = nome;
        this.estado = estado;
    }
}


class ClienteMQTTDebug
{
    constructor()
    {
        var nome = makeid;
        this.codigo = nome;
        this.nome = nome;
        this.estado = false;
        this.topicos = new Array();
        this.topicos.push(nome);
    }

    CriarID()
    {
        var texto = "";
        var possiveis = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < possiveis.length; i++)
            texto += possible.charAt(Math.floor(Math.random() * possible.length));

        return texto;
    }
}


module.exports = ClienteMQTT, ClienteMQTTDebug;