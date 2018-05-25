var express = require('express');
var router = express.Router();
var PainelSolar = require('./../models/db/PainelSolar');
var LogEventos = require('./../models/db/LogEventos');
router.get('/', function(req, res, next)
{
  res.render('paginaInicial');
});

router.get('/topicos', function(req, res, next)
{
  var dispositivos = req.app.locals.servidorMosca.GetSimpleDisp();
  res.render('topicos', {dispositivos : JSON.stringify(dispositivos)});
});

router.get('/configuracoes', function(req, res, next) {

  var codigo = req.query.codigo;
  try
  {
    var dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo).ToSimpleOBJ();
    res.render('configuracoes', {dispositivo : dispositivo});
  }
  catch(err)
  {
    res.status(500).render('layouts/error', {error : err, message : 'Ocorreu algo de errado.'});
  }
  

});


router.get('/energia', function(req, res, next) 
{
  PainelSolar.find({}, function(err, resultado)
  {
    res.render("energia", {logSolar : JSON.stringify(resultado)});
  });
});
router.get('/log', function(req, res, next) 
{
  LogEventos.find({}, function(err, resultado)
  {
    var envio = new Array();
    for(var i = resultado.length - 1; i >= 0; i--)
    {
      var tempo = new Date(resultado[i].tempo);
      var tempoFormated = tempo.getDate() + "/" + tempo.getMonth() + "/" + tempo.getFullYear() + " " + tempo.getHours() + ":" + tempo.getMinutes() + ":" + tempo.getSeconds();
      envio.push({evento : resultado[i].evento, tempo : tempoFormated});
    }
    res.render("log", {logeventos : envio});
  });
});


module.exports = router;
