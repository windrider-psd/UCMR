var express = require('express');
var DispositivoModel = require('./../models/db/Dispositivo');
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

    DispositivoModel.findOne({idDispositivo: codigo}, function(err, resultado)
    {
      if(err || resultado == null)
      {
        res.status(404).render('layouts/error', {error : "Disipositivo não encontrado", message : 'Dispositivo não encontrado'});
      }
      else
      {
        res.render('configuracoes', {dispositivo : resultado});
      }
      
    })
    //var dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo).ToSimpleOBJ();
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
