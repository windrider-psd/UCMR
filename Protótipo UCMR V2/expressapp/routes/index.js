var express = require('express');
var router = express.Router();
var clienteMQTT = require('../mqtt-debug.js');
/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/



function homeView(req, res, next)
{
  var contexto = req.dataProcessed;
  if(typeof(contexto) === 'undefined')
  {
    contexto = {};
  }


  res.render('paginaInicial', contexto);
}


router.get('/', homeView);

router.get('/adicionarsonoff', function(req, res, next)
{
  var nome = makeid();
  req.app.locals.clientesConectados.push(new clienteMQTT(nome, nome, false));

  req.dataProcessed = {mensagem : {conteudo : 'Sonoff adicionado com sucesso', tipo : 'success'}};

  return next();

}, homeView);

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 23; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
module.exports = router;
