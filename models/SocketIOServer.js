const ip = require('ip');
const sanitazier = require('sanitizer');
let instancia = null;
let configuracoes = require('./../ucmr.config')
class SocketIOServer
{
    LimparObj(obj)
    {
        for(var chave in obj)
        {
            if(typeof(obj[chave]) == "object")
            {
                LimparObj(obj[chave]);
            }
            else if(typeof(obj[chave]) == "string")
            {
                obj[chave] = sanitazier.escape(obj[chave]);
            }
        }
    }

    CriarSocket(express_app)
    {
        let http = require('http').Server(express_app);
        this.socket = require('socket.io')(http);
        http.listen(configuracoes.ioport, ip.address().toString());
    }

    Emitir(evento, mensagem)
    {
        this.socket.emit(evento, mensagem);
    }

    /**
     * @returns {SocketIOServer}
     */
    static getIntance()
    {
        if(instancia == null)
        {
            instancia = new SocketIOServer()
        }
        return instancia
    }

}


module.exports = SocketIOServer;

