var express = require('express');
var router = express.Router();
var redis = require("redis");
var clienteRedis = redis.createClient();
var sqlite = require('sqlite-sync');
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


router.get('/energia', function(req, res, next) {

    var logObj = sqlite.run("select * from log_producao");
    //var logPainel = sqlite.run("select * from log_producao_painelsolar");
    //console.log(logPainel);
    var ids = sqlite.run("select id as id from log_producao_painelsolar group by id");
    var logsolar = new Array();
    for(var i = 0; i < ids.length; i++)
    {
      logsolar.push(sqlite.run("select * from log_producao_painelsolar where id = '"+ids[i].id+"'"));
    }
    clienteRedis.mget(["producao-dia", "producao-atual"], function(err, reply)
    {
      res.render("energia", {energiaDia : reply[0].toString(), energiaAtual : reply[1].toString(), log : JSON.stringify(logObj), logSolar : JSON.stringify(logsolar)});
    });

 

});

module.exports = router;
