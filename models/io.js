var socket;
var ip = require('ip');
var app;
function CriarSocket(app_object)
{
    app = app_object;
    var http = require('http').Server(app);
    socket = require('socket.io')(http);
    http.listen(app.locals.ioPort, ip.address().toString());
    socket.on('connection', function(cliente)
    {
        cliente.on('att estado sonoff', function(mensagem) //Atualização de estado de dipositivo
        {
            cliente.broadcast.emit("att estado sonoff", mensagem);
        });
        cliente.on('update sonoff', function(mensagem) //Sonoff Adicionado
        {
            var dispMsg = app.locals.servidorMosca.GetSimpleDisp();
            cliente.broadcast.emit("update sonoff", JSON.stringify(dispMsg));
        });
        cliente.on('att nome sonoff', function(mensagem) //Atualização de nome de sonoff
        {
            cliente.broadcast.emit("att nome sonoff", mensagem);
        });
        cliente.on('att painel', function(mensagem) //Atualização de info de painel solar
        {
            cliente.broadcast.emit("att painel", mensagem);
        });
        cliente.on('add painel', function(mensagem) //Adição de painel solar
        {
            cliente.broadcast.emit("add painel", mensagem);
        });
        cliente.on('rem painel', function(mensagem) //Remoção de painel solar
        {
            cliente.broadcast.emit("rem painel", mensagem);
        });

        cliente.on('sonoff rem topico', function(mensagem) // Remoção de um tópico à um sonoff
        {
            var obj = JSON.parse(mensagem);
            cliente.broadcast.emit(obj.codigo + " rem topico", mensagem);
            var dispMsg = app.locals.servidorMosca.GetSimpleDisp();
            cliente.broadcast.emit("topicos updated", JSON.stringify(dispMsg));
        });

        cliente.on('sonoff add topico', function(mensagem)//Adição de um tópico à um sonoff
        { 
            var obj = JSON.parse(mensagem);
            cliente.broadcast.emit(obj.codigo + " add topico", mensagem);

            var dispMsg = app.locals.servidorMosca.GetSimpleDisp();
            cliente.broadcast.emit("topicos updated", JSON.stringify(dispMsg));
        });
    
    
    });
}

function Emitir(evento, mensagem)
{
    socket.emit(evento, JSON.stringify(mensagem));
}

module.exports = {CriarSocket : CriarSocket, Emitir : Emitir};

