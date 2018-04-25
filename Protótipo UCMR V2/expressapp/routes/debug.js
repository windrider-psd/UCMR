var express = require('express');
var router = express.Router();
var classesMQTT = require('../mqtt-classes.js');

router.get('/adicionarsonoff', function(req, res, next)
{
    req.app.locals.hardwaresDebug.push(new classesMQTT.HardwareMQTTDebug());
    res.json({mensagem : {conteudo : 'Sonoff adicionado com sucesso', tipo : 'success'}});
});

module.exports = router;