var express = require('express');
var router = express.Router();



router.get('/getsonoffs', function(req, res, next)
{
  res.json(req.app.locals.servidorMosca.dispositivos);

});

router.post('/sonoff/togglepower', function (req, res, next)
{
    var disps = req.app.locals.servidorMosca.dispositivos;
    var codigo = req.body.codigo;
    var encontrado = false;
    for(var i = 0; i < disps.length; i++)
    {
        if(disps[i].codigo == codigo)
        {
            encontrado = true;
            disps[i].estado = req.body.valor;
            res.json({mensagem : {conteudo : 'Energia alterada', tipo : 'success'}});
            
        }
    }
    if(!encontrado)
        res.json({mensagem : {conteudo : 'Sonoff não encontrado', tipo : 'danger'}});

});

module.exports = router;