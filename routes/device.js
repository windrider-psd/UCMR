let express = require('express');
let router = express.Router();
const models = require('../models/DBModels')
let sanitizer = require('sanitizer');
let socket = require('../models/SocketIOServer').getIntance()
let globalStorage = require('../services/GlobalStorage')
let lodash = require('lodash')

function SolarTypeToString(type)
{
    type = Number(type);
    let tipoString;
    switch(type)
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

router.get('/device', (req, res) => {

    let deviceId = req.query.deviceId;
  
    if(deviceId != null)
    {
        models.Device.findOne({deviceId: deviceId}, (err, result) =>
        {
            if(err)
            {
                res.status(500).end(err.message)
            }
            else if(result == null)
            {
                res.status(404).end("Device not found!")
            }
            else
            {
                res.status(200).json(result)
            }   
        });
    }
    else
    {
        models.Device.find({}, (err, allDevices) =>
        {
            if(err)
            {
                res.status(500).end(err.message)
            }
            else
            {
                let arr = []
                lodash.each(allDevices, (device) => {
                    arr.push(device.toObject());
                })
                
                res.json(arr);
            }
        });        
    }
});

router.delete('/topic', (req, res) =>
{
    let deviceId = req.body.deviceId;
    let topic = req.body.topic;

    globalStorage.huskyServer.UnsubscribeDeviceTopic(deviceId, topic)
        .then((devices) =>{
            res.status(200).json({});
            
            /*let mensagem = {codigo : deviceId, topico : topico};
            let dispMsg = servidor_mqtt.GetSimpleDisp();

            socket.Emitir(mensagem.codigo + " rem topico", mensagem);;
            socket.Emitir("topicos updated", dispMsg);*/
        })
        .catch(err => {
            res.status(500).end(err.message)
        })
});

router.put('/power', (req, res) =>
{
    let newState = req.body.value == "1";
    let queryType = req.body.queryType;
    let query = req.body,query;
    
    try
    {
        /**
         * @type {Promise}
         */
        let promise;
        if(queryType == "deviceId")
        {
            promise = globalStorage.huskyServer.SetDeviceStateById(query, newState)
        }
        else if(queryType == "topic")
        {
            promise = globalStorage.huskyServer.SetDeviceStateByTopic(query, newState)
               
        }
        else if(queryType == "name")
        {
            promise = globalStorage.huskyServer.SetDeviceStateByName(query, newState)
        }
        else
        {
            res.status(400).end("Invalid query type");
            return
        }
        promise
            .then((devices) => {

                let arr = []
                lodash.each(devices, (device) =>{
                    arr.push(device.toObject())
                })
                res.status(200).json({devices: arr})
            })
            .catch(err =>{
                res.status(500).end(err.message)
            })
    }
    catch(err)
    {
        res.status(500).end(err.message)
    }
});


router.delete('/device', (req, res) =>
{
    let deviceId = req.body.deviceId;
    models.Device.deleteOne({deviceId : deviceId}, function(err)
    {
        if(err)
            res.status(500).end(err.message)
        else
        {
            /*let dispMsg = servidor_mqtt.GetSimpleDisp();
            socket.Emitir("topicos updated", dispMsg);
            socket.Emitir("update sonoff", dispMsg);
            res.json({mensagem : {conteudo : 'Sonoff excluido com sucesso', tipo : 'success'}});*/

            res.status(200).json({})
        }
            
    })
});

router.put('/name', (req, res) =>
{
    let deviceId = req.body.deviceId
    let name = sanitizer.escape(req.body.name);
    name = name.trim();
    name = name.replace(/ +(?= )/g,'');
    name = name.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    if(name.length < 1)
    {
        res.status(400).end("The name must be at least 1 character long.");
        return;
    }

    models.Device.findOne({deviceId : deviceId}, (err, device) =>
    {
        if(err || device == null)
        {
            res.status(400).end("Device not found.")
        }
        else
        {
            globalStorage.huskyServer.UpdateDeviceName(deviceId, name)
                .then(() => {
                    res.status(200).json({})
                })
                .catch(err => {
                    res.status(500).end(err.message)
                })
        }
    });
});


router.post('/topic', (req, res) =>
{
    let deviceId = req.body.deviceId
    let topic = req.body.topic;
    topic = topic.replace(/\s/g, "");
    topic = topic.replace(/\\/g, "/");

    let formatoTopico = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]+/;
    if(formatoTopico.test(topic))
    {
        res.status(400).end("Special character are not allowed")
        return;
    }
    
    let resto = function(err)
    {
        if(err)
        {
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        }
        else
        {   
            
        }
    }
    servidor_mqtt.InscreverTopico(deviceId, topic, resto);

    globalStorage.huskyServer.SubscribeDeviceToTopic(deviceId, topic)
        .then((device) =>{
            res.status(200).json({})

            /*let mensagem = {codigo : deviceId, topico : topic};
            let dispMsg = servidor_mqtt.GetSimpleDisp();

            socket.Emitir(mensagem.codigo + " add topico", mensagem);;
            socket.Emitir("topicos updated", dispMsg);*/
        })
        .catch(err => {
            res.status(500).end(err.message)
        })
});


router.post('/painel/adicionar', (req, res) =>
{
    let nome = sanitizer.escape(req.body.nome);
    
    let host = sanitizer.escape(req.body.host);
    let caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    let tipo = req.body.tipo;
    let obj = {nome : nome, host : host, path : caminho, tipo : tipo};
    obj.logs = [];
    try
    {
        let novo = new models.SolarPanel(obj);
        novo.save();
        socket.Emitir('add painel', novo);
        new models.EventLog({tempo : new Date(), evento : "Painel solar " +novo.nome+" adicionado", tipo : 2}).save();
        res.json({mensagem : {conteudo : 'Painel solar adicionado com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
});

router.post('/painel/excluir', (req, res) =>
{
    let id = req.body.id;

    models.SolarPanel.findOne({_id : id}, function(err, painel)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            painel.remove();
            socket.Emitir('rem painel', id);
            new models.EventLog({tempo : new Date(), evento : "Painel solar " +painel.nome+" removido", tipo : 2}).save();
            res.json({mensagem : {conteudo : 'Painel solar removido com sucesso.', tipo : 'success'}});
        }
           
    });
    
});

router.get("/painel/getlogsolar", (req, res) =>
{
    models.SolarPanel.find({}, (err, resultado) =>
    {
      res.json({logSolar : resultado});
    });
});

router.get('/painel/excluirlog', (req, res) =>
{

    models.SolarPanel.find({}, (err, paineis) =>
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            new models.EventLog({tempo : new Date(), evento : "Logs dos paineis solares excluidos", tipo : 2}).save();
            for(let i = 0; i < paineis.length; i++)
            {
                paineis[i].logs = new Array();
                paineis[i].save();
            }

            res.json({mensagem : {conteudo : 'Dados excluidos com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.post('/painel/editar', (req, res) =>
{
    let id = req.body.id;
    let nome = sanitizer.escape(req.body.nome); 
    let caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    
    let tipo = req.body.tipo;
    let host = sanitizer.escape(req.body.host);

    models.SolarPanel.findOne({_id : id}, (err, painel) =>
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
            socket.Emitir('att painel', painel);
            new models.EventLog({tempo : new Date(), evento : "Edição do painel solar "+painel._id+" para: nome = "+painel.nome+", host = "+painel.host+", caminho = "+painel.path+" e tipo =  "+SolarTypeToString(painel.tipo), tipo : 2}).save()
            res.json({mensagem : {conteudo : 'Painel solar editado com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.get('/log/getlog', (req, res) =>
{
    models.EventLog.find({}, function(err, resultado)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : '', tipo : 'success'}, log : resultado});
    }).sort('-tempo');
});


router.get('/log/excluir', (req, res) =>
{
    models.EventLog.deleteMany({}, (err, resultado) =>
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Log excluido com sucesso', tipo : 'success'}, log : resultado});
    })

});



router.post('/residencial/adicionar', (req, res) =>
{
    let cenario = req.body.cenario;
    let novo = new models.SimuladorResidencial(cenario);
    novo.save((err) =>
    {
        if(err)
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Cenário concluido com sucesso', tipo : 'success'}});
    })

});

router.get('/get-server-data', (req, res) => {
    res.status(200).json(req.app.locals.serverdata)
})


let promessasSensor = []

router.post('/sensor', (req, res) => {
    let params = req.body
    let servidor = servidor_mqtt
    Promise.all(promessasSensor)
        .then(() => {
            promessasSensor.push(servidor.AdicionarSensor(params.codigo, params.tipo, params.gpio)
                .then(() => {
                    promessasSensor = new Array()
                    res.status(200).end("")
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })   
            )
        })
    
})

router.delete('/sensor', (req, res) => {
    let params = req.body
    let servidor = servidor_mqtt

    Promise.all(promessasSensor)
        .then(() => {
            promessasSensor.push(servidor.RemoverSensor(params.codigo, params.gpio)
                .then(() => {
                    promessasSensor = new Array()
                    res.status(200).end("")
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })
            )
        })
})

router.patch('/sensor', (req, res) => {
    let params = req.body
    let servidor = servidor_mqtt

    Promise.all(promessasSensor)
        .then(() => {
            promessasSensor.push(servidor.EditarGPIOSensor(params.codigo, params.tipo, params.gpio)
                .then(() => {
                    promessasSensor = new Array()
                    res.status(200).end("")
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })
            )
        })

})

module.exports = router;