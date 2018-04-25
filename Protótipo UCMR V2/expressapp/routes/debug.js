var express = require('express');
var router = express.Router();
var clienteMQTT = require('../mqtt-debug.js');



router.get('/adicionarsonoff', function(req, res, next)
{
  var nome = makeid();
  var novoCliente = new clienteMQTT(nome, nome, false);
    req.app.locals.servidorMosca.AdicionarDispositivo(novoCliente, function()
    {
        res.json({mensagem : {conteudo : 'Sonoff adicionado com sucesso', tipo : 'success'}});
    });
  

});

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 23; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
module.exports = router;