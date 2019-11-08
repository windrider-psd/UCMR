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
    let query = req.body.query;
    
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

    let topicFormat = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]+/;
    if(topicFormat.test(topic))
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
})




let sensorPromisses = []
router.post('/sensor', (req, res) => {
    let params = req.body
    Promise.all(sensorPromisses)
        .then(() => {
            sensorPromisses.push(globalStorage.huskyServer.AddSensor(params.id, params.type, params.gpio)
                .then(() => {
                    sensorPromisses = new Array()
                    res.status(200).json({})
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })   
            )
        })
})

router.delete('/sensor', (req, res) => {
    let params = req.body
    Promise.all(sensorPromisses)
        .then(() => {
            sensorPromisses.push(globalStorage.huskyServer.RemoveSensor(params.id, params.gpio)
                .then(() => {
                    sensorPromisses = new Array()
                    res.status(200).json({})
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })
            )
        })
})

router.put('/sensor', (req, res) => {
    let params = req.body

    Promise.all(sensorPromisses)
        .then(() => {
            sensorPromisses.push(globalStorage.huskyServer.UpdateSensorGPIO(params.id, params.type, params.gpio)
                .then(() => {
                    sensorPromisses = new Array()
                    res.status(200).json({})
                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })
            )
        })

})

module.exports = router;