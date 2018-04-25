var express = require('express');
var router = express.Router();
var clienteMQTT = require('../mqtt-debug.js');




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

module.exports = router;

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/