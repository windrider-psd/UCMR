var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next)
{
  res.render('paginaInicial');
});

router.get('/simulador', function(req, res, next)
{
  res.render('simulador');
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
    res.render("energia");
});
router.get('/log', function(req, res, next) 
{
  res.render("log");
});


module.exports = router;
