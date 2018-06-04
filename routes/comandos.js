var express = require('express');
var router = express.Router();
var PainelSolar = require('./../models/db/PainelSolar');

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
        req.app.locals.servidorMosca.DesinscreverTopico(codigo, topico);
        res.json({mensagem : {conteudo : 'Topico removido com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : "Houve um erro interno." + err, tipo : "danger"}});
    }
    
});

router.post('/sonoff/togglepower', function (req, res, next)
{
    var ligar = req.body.valor == "1";
    var filtro = req.body.filtro;
    try
    {
        if(req.body.tipo == "codigo")
        {
            var disp = req.app.locals.servidorMosca.GetDispositivo(filtro);
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            disp.Estado = ligar;
            if(ligar)
                res.json({mensagem : {conteudo : 'Dispositivo ligado.', tipo : 'success'}});
            else
                res.json({mensagem : {conteudo : 'Dispositivo desligado.', tipo : 'success'}});
            
        }
        else if(req.body.tipo == "topico")
        {
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            req.app.locals.servidorMosca.SetEstadoDispTopico(filtro, ligar);
            if(ligar)
                    res.json({mensagem : {conteudo : 'Dispositivos ligados.', tipo : 'success'}});
                else
                    res.json({mensagem : {conteudo : 'Dispositivos desligados.', tipo : 'success'}});
        }
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: ' + err, tipo : 'danger'}});
    }
    

});

router.post('/sonoff/alterarNome', function(req, res, next)
{
    var codigo = req.body.codigo;
    var nome = req.body.nome;
    nome = nome.trim();
    nome = nome.replace(/ +(?= )/g,'');
    nome = nome.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    if(nome.length < 1)
    {
        res.json({mensagem : {conteudo : 'O nome deve conter pelo menos 1 caractere.', tipo : 'warning'}});
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
    topico = topico.replace(/\s/g, "");
    topico = topico.replace(/\\/g, "/");

    var formatoTopico = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]+/;
    if(formatoTopico.test(topico))
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>Não use caractéres especiais no nome do tópico</strong>.', tipo : 'danger'}});
        return;
    }
    
    try
    {
        req.app.locals.servidorMosca.InscreverTopico(codigo, topico);
        res.json({mensagem : {conteudo : 'O dispositivo inscrito no tópico <strong>'+topico+'</strong> com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
   
});


router.post('/painel/adicionar', function(req, res, next)
{
    var nome = req.body.nome;
    var host = req.body.host;
    var caminho = req.body.caminho;
    var tipo = req.body.tipo;
    try
    {
        var novo = new PainelSolar({nome : nome, host : host, path : caminho, tipo : tipo, logs : []});
        novo.save();
        res.json({mensagem : {conteudo : 'Painel solar adicionado com sucesso.', tipo : 'success'}, painel : novo});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
});

router.post('/painel/excluir', function(req, res, next)
{
    var id = req.body.id;

    PainelSolar.deleteOne({_id : id}, function(err)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Painel solar removido com sucesso.', tipo : 'success'}});
    });
    
});

router.post('/painel/editar', function(req, res, next)
{
    var id = req.body.id;
    var nome = req.body.nome; 
    var caminho = req.body.caminho;
    var tipo = req.body.tipo;
    var host = req.body.host;
    PainelSolar.findOne({_id : id}, function(err, painel)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            painel.nome = nome;
            painel.caminho = caminho;
            painel.tipo = tipo;
            painel.host = host; 
            painel.save();
            res.json({mensagem : {conteudo : 'Painel solar editado com sucesso.', tipo : 'success'}});
    });
    
});

module.exports = router;