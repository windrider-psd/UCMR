var express = require('express');
var router = express.Router();
var classesMQTT = require('../models/classes-mqtt.js');

router.get('/adicionarsonoff', function(req, res, next)
{
    req.app.locals.hardwaresDebug.push(new classesMQTT.HardwareMQTTDebug());
    res.json({mensagem : {conteudo : 'Sonoff adicionado com sucesso', tipo : 'success'}});
});

router.post('/enviarMensagem', function(req, res, next)
{
    var mensagem = req.body.mensagem;
    try
    {
        var topico = req.body.topico;
        comandos = mensagem.split('\\n');
        var particaocomandos = comandos[1].split('\\r');
        var particaoString = "";
        for(var i = 0; i < particaocomandos.length; i++)
        {
            particaoString += particaocomandos[i];
            if(typeof particaocomandos[i + 1] !== 'undefined')
            {
              particaoString += '\r';
            }
        }

        req.app.locals.servidorMosca.clienteMaster.publish(topico, comandos[0]+"\n"+particaoString);
        res.json({mensagem : {conteudo : 'Mensagem <strong>'+mensagem+'</strong> enviada com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Houve um erro ao enviar a mensagem <strong>'+err+'</strong>..', tipo : 'danger'}});
    }

});

router.get('/adicionarsolargetter', function(req, res, next)
{
    req.app.locals.ControladorSolar.CriarSolarGetterDebug();
    res.json({mensagem : {conteudo : 'Painel solar adicionado com sucesso', tipo : 'success'}});
});



module.exports = router;