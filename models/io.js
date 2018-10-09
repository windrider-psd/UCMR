var socket;
var ip = require('ip');
var app;
var sanitazier = require('sanitizer');

function LimparObj(obj)
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

function CriarSocket(app_object)
{
    app = app_object;
    var http = require('http').Server(app);
    socket = require('socket.io')(http);
    http.listen(app.locals.serverdata.ioPort, ip.address().toString());
}

function Emitir(evento, mensagem)
{
    socket.emit(evento, mensagem);
}

module.exports = {CriarSocket : CriarSocket, Emitir : Emitir};

