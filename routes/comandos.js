var express = require('express');
var router = express.Router();
var PainelSolar = require('./../models/db/PainelSolar');
var LogEventos = require('./../models/db/LogEventos');
var DispositivosModel = require('./../models/db/Dispositivo');
var sanitizer = require('sanitizer');
function SolarTipoToString(tipo)
{
    tipo = Number(tipo);
    var tipoString;
    switch(tipo)
    {
        case 0:
            tipoString = "Debug";
            break;
        case 1:
            tipoString = "Fronius";
            break;
        default:
            tipoString = "Desconhecido";
    }
    return tipoString;
}

router.get('/sonoff/getsonoffs', function(req, res, next)
{
    var dispo = req.app.locals.servidorMosca.GetSimpleDisp();
    var resposta = new Array();
    
    DispositivosModel.find({}, function(err, resultado)
    {
        
        for(var i = 0; i < resultado.length; i++)
        {
            resposta.push({codigo : resultado[i].idDispositivo, nome : resultado[i].nome, topicos : resultado[i].topicos, conectado : false, estado : false, debug : resultado[i].debug});
            for(var j = 0; j < dispo.length; j++)
            {
                if(resultado[i].idDispositivo == dispo[j].codigo)
                {
                    resposta[i].conectado = true;
                    resposta[i].estado = dispo[j].estado;
                    break;
                }
            }
        }
        res.json(resposta);
    });
   
});

router.get('/sonoff/gettopicos', function(req, res, next)
{
    var codigo = req.query.codigo;
    DispositivosModel.findOne({idDispositivo : codigo}, function (err, resultado)
    {
        res.json({topicos : resultado.topicos});
    });
});

router.post('/sonoff/removerTopico', function(req, res, next)
{
    var codigo = req.body.codigo;
    var topico = req.body.topico;

    var resto = function(err)
    {
        if(err)
        {
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        }
        else
        {   
            var mensagem = {codigo : codigo, topico : topico};
            var dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();

            req.app.locals.io.Emitir(mensagem.codigo + " rem topico", mensagem);;
            req.app.locals.io.Emitir("topicos updated", dispMsg);

            res.json({mensagem : {conteudo : 'Topico removido com sucesso.', tipo : 'success'}});
        }
    }
    req.app.locals.servidorMosca.DesinscreverTopico(codigo, topico, resto);
    
});

router.post('/sonoff/togglepower', function (req, res, next)
{
    var ligar = req.body.valor == "1";
    var filtro = req.body.filtro;
    var codigos = new Array();
    try
    {
        if(req.body.tipo == "codigo")
        {
            var disp = req.app.locals.servidorMosca.GetDispositivo(filtro);
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            disp.Estado = ligar;
            codigos.push(filtro);
            var mensagem = {codigos : codigos, valor : ligar};
            req.app.locals.io.Emitir('att estado sonoff', mensagem);
            if(ligar)
                res.json({mensagem : {conteudo : 'Dispositivo ligado.', tipo : 'success'}});
            else
                res.json({mensagem : {conteudo : 'Dispositivo desligado.', tipo : 'success'}});
            
            
        }
        else if(req.body.tipo == "topico")
        {
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            req.app.locals.servidorMosca.SetEstadoDispTopico(filtro, ligar);
            var disp = req.app.locals.servidorMosca.GetDispInTopico(filtro);
            for(var i = 0; i < disp.length; i++)
            {
                codigos.push(disp[i].codigo);
            }
            var mensagem = {codigos : codigos, valor : ligar};
            req.app.locals.io.Emitir('att estado sonoff', mensagem);
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


router.post('/sonoff/excluir', function (req, res, next)
{
    var codigo = req.body.codigo;
    DispositivosModel.deleteOne({idDispositivo : codigo}, function(err)
    {
        if(err)
            res.json({mensagem : {conteudo : 'Houve um erro ao excluir o sonoff', tipo : 'warning'}});
        else
        {
            var dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();
            req.app.locals.io.Emitir("topicos updated", dispMsg);
            req.app.locals.io.Emitir("update sonoff", dispMsg);
            res.json({mensagem : {conteudo : 'Sonoff excluido com sucesso', tipo : 'success'}});
        }
            
    })
});

router.post('/sonoff/alterarNome', function(req, res, next)
{
    var codigo = req.body.codigo;
    var nome = sanitizer.escape(req.body.nome);
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
    var mensagem = {codigo : codigo, nome : nome};
    req.app.locals.io.Emitir('att nome sonoff', mensagem);
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
    
    var resto = function(err)
    {
        if(err)
        {
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        }
        else
        {   
            var mensagem = {codigo : codigo, topico : topico};
            var dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();

            req.app.locals.io.Emitir(mensagem.codigo + " add topico", mensagem);;
            req.app.locals.io.Emitir("topicos updated", dispMsg);

            res.json({mensagem : {conteudo : 'O dispositivo inscrito no tópico <strong>'+topico+'</strong> com sucesso.', tipo : 'success'}});
        }
    }
    req.app.locals.servidorMosca.InscreverTopico(codigo, topico, resto);
});


router.post('/painel/adicionar', function(req, res, next)
{
    var nome = sanitizer.escape(req.body.nome);
    
    var host = sanitizer.escape(req.body.host);
    var caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    var tipo = req.body.tipo;
    var obj = {nome : nome, host : host, path : caminho, tipo : tipo};
    obj.logs = [];
    try
    {
        var novo = new PainelSolar(obj);
        novo.save();
        req.app.locals.io.Emitir('add painel', novo);
        new LogEventos({tempo : new Date(), evento : "Painel solar " +novo.nome+" adicionado", tipo : 2}).save();
        res.json({mensagem : {conteudo : 'Painel solar adicionado com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
});

router.post('/painel/excluir', function(req, res, next)
{
    var id = req.body.id;

    PainelSolar.findOne({_id : id}, function(err, painel)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            painel.remove();
            req.app.locals.io.Emitir('rem painel', id);
            new LogEventos({tempo : new Date(), evento : "Painel solar " +painel.nome+" removido", tipo : 2}).save();
            res.json({mensagem : {conteudo : 'Painel solar removido com sucesso.', tipo : 'success'}});
        }
           
    });
    
});

router.get("/painel/getlogsolar", function(req,res, next)
{
    PainelSolar.find({}, function(err, resultado)
    {
      res.json({logSolar : resultado});
    });
});

router.get('/painel/excluirlog', function(req, res, next)
{

    PainelSolar.find({}, function(err, paineis)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            new LogEventos({tempo : new Date(), evento : "Logs dos paineis solares excluidos", tipo : 2}).save();
            for(var i = 0; i < paineis.length; i++)
            {
                paineis[i].logs = new Array();
                paineis[i].save();
            }

            res.json({mensagem : {conteudo : 'Dados excluidos com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.post('/painel/editar', function(req, res, next)
{
    var id = req.body.id;
    var nome = sanitizer.escape(req.body.nome); 
    var caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    
    var tipo = req.body.tipo;
    var host = sanitizer.escape(req.body.host);

    PainelSolar.findOne({_id : id}, function(err, painel)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            painel.nome = nome;
            painel.path = caminho;
            painel.tipo = tipo;
            painel.host = host; 
            painel.save();
            req.app.locals.io.Emitir('att painel', painel);
            new LogEventos({tempo : new Date(), evento : "Edição do painel solar "+painel._id+" para: nome = "+painel.nome+", host = "+painel.host+", caminho = "+painel.path+" e tipo =  "+SolarTipoToString(painel.tipo), tipo : 2}).save()
            res.json({mensagem : {conteudo : 'Painel solar editado com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.get('/log/getlog', function(req, res, next)
{
    LogEventos.find({}, function(err, resultado)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : '', tipo : 'success'}, log : resultado});
    }).sort('-tempo');
});
router.get('/log/excluir', function(req, res, next)
{
    LogEventos.deleteMany({}, function(err, resultado)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Log excluido com sucesso', tipo : 'success'}, log : resultado});
    })

});

module.exports = router;