var express = require('express');
var router = express.Router();

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

router.get('/', function(req, res, next)
{
  var lista = new Array();

  lista.push({codigo : 1, nome : "Lâmpada 1", estado : 0});
  lista.push({codigo : 2, nome : "Lâmpada 2", estado : 1});
  lista.push({codigo : 3, nome : "Ar condicionado", estado : 1});

  res.render('paginaInicial', {dispositivos : lista});
});

module.exports = router;
