let express = require('express');
let router = express.Router();
let path = require('path')

function render(view, res)
{
  res.sendFile(path.resolve('public/'+view+'.html')); 
}

function IsLoggedIn(req)
{
  return typeof (req.session.usuario) != 'undefined' && req.session.usuario != null;
}

router.get('/', function(req, res)
{
  IsLoggedIn(req) ? render('pagina-inicial', res) : render("login", res);
});

router.get('/simulador', (req, res) =>
{
  IsLoggedIn(req) ? render('simulador', res) : render("login", res);
});

router.get('/topicos', (req, res) =>
{
  IsLoggedIn(req) ? render('topicos', res): render("login", res);
});

router.get('/configuracoes', function(req, res) {
  IsLoggedIn(req) ? render('configuracoes', res): render("login", res)
});


router.get('/energia', (req, res) =>
{
  IsLoggedIn(req) ?render("energia", res): render("login", res);
});
router.get('/log', (req, res) =>
{
  IsLoggedIn(req) ?render("log", res): render("login", res);
});


module.exports = router;
