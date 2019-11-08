let express = require('express');
let router = express.Router();
/*const HardwareMQTTDebug = require('./../models/ClienteMQTTDebug')
let servidor = require('./../models/ServidorMQTT')
router.get('/adicionarsonoff', (req, res) =>
{
    req.app.locals.hardwaresDebug.push(new HardwareMQTTDebug());
    res.json({mensagem : {conteudo : 'Sonoff adicionado com sucesso', tipo : 'success'}});
});

router.post('/enviarMensagem', (req, res) =>
{
    let mensagem = req.body.mensagem;
    try
    {
        let topico = req.body.topico;
        comandos = mensagem.split('\\n');
        
        let particaoString = "";
        if(typeof(comandos[1]) !== 'undefined')
        {
            let particaocomandos = comandos[1].split('\\r');
            for(let i = 0; i < particaocomandos.length; i++)
            {
                particaoString += particaocomandos[i];
                if(typeof particaocomandos[i + 1] !== 'undefined')
                {
                    particaoString += '\r';
                }
            }
        }
           
        servidor.PublicarMensagem(topico, comandos[0]+"\n"+particaoString);
        res.json({mensagem : {conteudo : 'Mensagem <strong>'+mensagem+'</strong> enviada com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Houve um erro ao enviar a mensagem <strong>'+err+'</strong>..', tipo : 'danger'}});
    }

});

router.get('/adicionarsolargetter', (req, res) =>
{
    req.app.locals.SolarGetter.send({comando : 1});
    res.json({mensagem : {conteudo : 'Painel solar debug adicionado com sucesso', tipo : 'success'}});
});*/



module.exports = router;