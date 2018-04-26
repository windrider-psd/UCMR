var express = require('express');
var router = express.Router();

router.get('/sonoff/getsonoffs', function(req, res, next)
{
    res.json(req.app.locals.servidorMosca.GetSimpleDisp());
});

router.post('/sonoff/togglepower', function (req, res, next)
{
    var disps = req.app.locals.servidorMosca.dispositivos;
    if(req.body.tipo == "codigo")
    {
        var codigo = req.body.filtro;
        var encontrado = false;
        for(var i = 0; i < disps.length; i++)
        {
            if(disps[i].codigo == codigo)
            {
                encontrado = true;
                req.app.locals.servidorMosca.clienteMaster.publish(codigo,'tp\n'+req.body.valor);
                disps[i].Estado = req.body.valor == "1";
                res.json({mensagem : {conteudo : 'Energia alterada', tipo : 'success'}});
            }
        }
        if(!encontrado)
            res.json({mensagem : {conteudo : 'Sonoff não encontrado', tipo : 'danger'}});
    }
    

});

router.post('/sonoff/alterarNome', function(req, res, next)
{
    var codigo = req.body.codigo;
    var nome = req.body.nome;
    
    var dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo);
    dispositivo.Nome = nome;
    

    res.json({mensagem : {conteudo : 'Nome alterado para <strong>'+nome+'</strong> com sucesso', tipo : 'success'}});
});

module.exports = router;