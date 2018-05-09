var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var ip = require('ip');
var appobj;
socket.on('connection', function(cliente)
{
    cliente.on('att estado sonoff', function(mensagem) //Atualização de estado de dipositivo
    {
        cliente.broadcast.emit("att estado sonoff", mensagem);
    });
    cliente.on('update sonoff', function(mensagem) //Atualização de estado de dipositivo
    {
        var dispMsg = appobj.locals.servidorMosca.GetSimpleDisp();
        cliente.broadcast.emit("update sonoff", JSON.stringify(dispMsg));
    });
    cliente.on('att nome sonoff', function(mensagem) //Atualização de estado de dipositivo
    {
        cliente.broadcast.emit("att nome sonoff", mensagem);
    });

    cliente.on('sonoff rem topico', function(mensagem) //Atualização de estado de dipositivo
    {
        var obj = JSON.parse(mensagem);
        cliente.broadcast.emit(obj.codigo + " rem topico", mensagem);
        var dispMsg = appobj.locals.servidorMosca.GetSimpleDisp();
        cliente.broadcast.emit("topicos updated", JSON.stringify(dispMsg));
    });

    cliente.on('sonoff add topico', function(mensagem) //Atualização de estado de dipositivo
    {
        var obj = JSON.parse(mensagem);
        cliente.broadcast.emit(obj.codigo + " add topico", mensagem);

        var dispMsg = appobj.locals.servidorMosca.GetSimpleDisp();
        cliente.broadcast.emit("topicos updated", JSON.stringify(dispMsg));
    });
    
    
});
http.listen(8080, ip.address().toString());

function CriarSocket(app)
{
    appobj = app;
}

module.exports = CriarSocket;

