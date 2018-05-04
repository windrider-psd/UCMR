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
        try
        {
            var disp = req.app.locals.servidorMosca.GetDispositivo(codigo);
            var ligar = req.body.valor == "1";
            req.app.locals.servidorMosca.clienteMaster.publish(codigo,'tp\n'+req.body.valor);
            disp.Estado = ligar;
            if(ligar)
                res.json({mensagem : {conteudo : 'Dispositivo ligado', tipo : 'success'}});
            else
                res.json({mensagem : {conteudo : 'Dispositivo desligado.', tipo : 'success'}});
        }
        catch(err)
        {
            res.json({mensagem : {conteudo : 'Erro: ' + err, tipo : 'danger'}});
        }
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
    try
    {
        var disp = req.app.locals.servidorMosca.GetDispositivo(codigo);
        req.app.locals.servidorMosca.InscreverTopico(disp.codigo, topico);
        res.json({mensagem : {conteudo : 'O dispositivo inscrito no tópico <strong>'+topico+'</strong> com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
   
});

module.exports = router;