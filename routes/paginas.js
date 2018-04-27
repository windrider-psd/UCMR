var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next)
{
  res.render('paginaInicial');
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

module.exports = router;
