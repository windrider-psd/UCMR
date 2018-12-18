const models = require('./DBModels')
class ClienteMQTT
{
    constructor(cliente, nome)
    {
        this.cliente = cliente;
        this.codigo = cliente.id;
        this.nome = nome;
        this.estado = false;
        this.topicos = new Array();
        this.status = '1';
        this.tipo = null
    }

    //Simplifica os objetos
    ToSimpleOBJ() 
    {
        return {codigo : this.codigo, nome : this.nome, estado : this.estado, topicos : this.topicos, tipo : this.tipo } 
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
            new models.LogEventos({tempo : new Date(), evento : "Dispositivo " +this.codigo+ " renomeado de "+this.nome+" para " + nome, tipo : 1}).save();
            models.ModeloDispositivo.findOne({idDispositivo : this.codigo}, function(err, resultado)
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

module.exports = ClienteMQTT