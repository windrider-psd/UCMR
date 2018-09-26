let express = require('express');
let router = express.Router();
let path = require('path')

function render(view, res)
{
  res.sendFile(path.resolve('public/'+view+'.html')); 
}

router.get('/', function(req, res)
{
  render('pagina-inicial', res);
});

router.get('/simulador', (req, res) =>
{
  render('simulador', res);
});

router.get('/topicos', (req, res) =>
{
  render('topicos', res);
});

router.get('/configuracoes', function(req, res) {
    render('configuracoes', res)
});


router.get('/energia', (req, res) =>
{
    render("energia", res);
});
router.get('/log', (req, res) =>
{
  render("log", res);
});


module.exports = router;
