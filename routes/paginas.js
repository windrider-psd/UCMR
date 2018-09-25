var express = require('express');
var DispositivoModel = require('./../models/db/Dispositivo');
var router = express.Router();
let path = require('path')
function render(view, res)
{
  res.sendFile(path.resolve('public/'+view+'.html')); 
}

router.get('/', function(req, res)
{
  render('pagina-inicial', res);
});

router.get('/simulador', function(req, res)
{
  render('simulador', res);
});

router.get('/topicos', function(req, res)
{
  var dispositivos = req.app.locals.servidorMosca.GetSimpleDisp();
  render('topicos', res, {dispositivos : JSON.stringify(dispositivos)});
});

router.get('/configuracoes', function(req, res) {

  var codigo = req.query.codigo;

    DispositivoModel.findOne({idDispositivo: codigo}, function(err, resultado)
    {
      if(err || resultado == null)
      {
        res.status(404)
        render('layouts/error', res, {error : "Disipositivo não encontrado", message : 'Dispositivo não encontrado'});
      }
      else
      {
        render('configuracoes', res, {dispositivo : resultado});
      }
      
    });
    
});


router.get('/energia', function(req, res) 
{
    render("energia", res);
});
router.get('/log', function(req, res) 
{
  render("log", res);
});


module.exports = router;
