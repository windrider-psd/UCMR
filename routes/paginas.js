var express = require('express');
var DispositivoModel = require('./../models/db/Dispositivo');
var router = express.Router();
let glob = require('glob')

function render(view, res, params)
{
  glob('./view/pages/'+view+'/*.jade', (err, pages) => {
    console.log(pages)
    let pagename = pages[0].split('/')
    pagename = pagename[pagename.length - 1]
    paganame = pagename.split('.')[0]
    res.render("pages/" + view + '/' + pagename, params)
  })
  
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
