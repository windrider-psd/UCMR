var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var ip = require('ip');
var appobj;
socket.on('connection', function(cliente)
{
    cliente.on('attestdisp', function(mensagem) //Atualização de estado de dipositivo
    {
        var msgobj = JSON.parse(mensagem);
        var disp = appobj.locals.servidorMosca.GetDispositivo(msgobj.codigo).ToSimpleOBJ();
        cliente.broadcast.emit("attestdisp", JSON.stringify(disp));
    });
    cliente.on('updatedisp', function(mensagem) //Atualização de estado de dipositivo
    {
        cliente.broadcast.emit("updatedisp", "");
    });
    cliente.on('attnomedisp', function(mensagem) //Atualização de estado de dipositivo
    {
        cliente.broadcast.emit("attnomedisp", mensagem);
    });
    
    
});
http.listen(8080, ip.address().toString());

function CriarSocket(app)
{
    appobj = app;
}

module.exports = CriarSocket;

