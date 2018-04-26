var express = require('express');
var router = express.Router();

router.get('/sonoff/getsonoffs', function(req, res, next)
{
    res.json(req.app.locals.servidorMosca.GetSimpleDisp());
});

router.get('/sonoff/gettopicos', function(req, res, next)
{
    var codigo = req.query.codigo;
    var retorno = req.app.locals.servidorMosca.GetDispositivo(codigo).ToSimpleOBJ().topicos;
    res.json({topicos : retorno});
});

router.post('/sonoff/removerTopico', function(req, res, next)
{
    var codigo = req.body.codigo;
    var topico = req.body.topico;
    console.log(codigo);
    console.log(topico);
    try
    {
        var dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo);
        req.app.locals.servidorMosca.clienteMaster.publish(codigo,'unsub\n'+topico);
        dispositivo.SubTopicos(topico);
        res.json({mensagem : {conteudo : 'Topico removido com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        console.log(err);
        res.json({mensagem : {conteudo : "Houve um erro interno.", tipo : "danger"}});
    }
    
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
                res.json({mensagem : {conteudo : 'Energia alterada.', tipo : 'success'}});
            }
        }
        if(!encontrado)
            res.json({mensagem : {conteudo : 'Sonoff não encontrado.', tipo : 'danger'}});
    }
    

});

router.post('/sonoff/alterarNome', function(req, res, next)
{
    var codigo = req.body.codigo;
    var nome = req.body.nome;
    nome = nome.trim();
    nome = nome.replace(/ +(?= )/g,'');
    if(nome.length < 4)
    {
        res.json({mensagem : {conteudo : 'O nome deve conter pelo menos 4 caractéres.', tipo : 'warning'}});
        return;
    }
    var dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo);
    dispositivo.Nome = nome;
    

    res.json({mensagem : {conteudo : 'Nome alterado para <strong>'+nome+'</strong> com sucesso.', tipo : 'success'}});
});

router.post('/sonoff/inscreverTopico', function(req, res, next)
{
    var codigo = req.body.codigo;
    var topico = req.body.topico;
    topico = topico.trim();
    topico = topico.replace(/ +(?= )/g,'');
    if(topico.length < 4)
    {
        res.json({mensagem : {conteudo : 'O nome deve conter pelo menos 4 caractéres.', tipo : 'warning'}});
        return;
    }
    if(req.app.locals.servidorMosca.GetDispositivo(codigo).AddTopicos(topico))
    {
        req.app.locals.servidorMosca.clienteMaster.publish(codigo,'sub\n'+topico);
        res.json({mensagem : {conteudo : 'O dispositivo inscrito no tópico <strong>'+topico+'</strong> com sucesso.', tipo : 'success'}});
    }
    else
    {
        res.json({mensagem : {conteudo : 'O dispositivo já está inscrito no tópico <strong>'+topico+'</strong>.', tipo : 'warning'}});
    }  
});

module.exports = router;