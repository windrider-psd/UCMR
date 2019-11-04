const ip = require('ip');
const sanitazier = require('sanitizer');
let instance = null;
let config = require('./../ucmr.config')
class SocketIOServer
{
    ClearObject(obj)
    {
        for(let key in obj)
        {
            if(typeof(obj[key]) == "object")
            {
                this.ClearObject(obj[key]);
            }
            else if(typeof(obj[key]) == "string")
            {
                obj[key] = sanitazier.escape(obj[key]);
            }
        }
    }

    CreateSocket(express_app)
    {
        let http = require('http').Server(express_app);
        this.socket = require('socket.io')(http);
        http.listen(config.ioPort, ip.address().toString());
    }

    Emit(evento, mensagem)
    {
        this.socket.emit(evento, mensagem);
    }

    /**
     * @returns {SocketIOServer}
     */
    static getIntance()
    {
        if(instance == null)
        {
            instance = new SocketIOServer()
        }
        return instance
    }

}


module.exports = SocketIOServer;

