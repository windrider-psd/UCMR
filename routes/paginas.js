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
    render('configuracoes', res)
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
