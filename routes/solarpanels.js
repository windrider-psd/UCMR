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


router.post('/', (req, res) =>
{
    let name = sanitizer.escape(req.body.name);
    
    let host = sanitizer.escape(req.body.host);
    let path = sanitizer.unescapeEntities(req.body.path).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    let type = req.body.type;

    
    try
    {
        let obj = {name : name, host : host, path : path, type : type, logs: []};

        models.SolarPanel.create(obj)
            .then((solarPanel) => {
                //new models.EventLog({tempo : new Date(), evento : "Painel solar " +novo.nome+" adicionado", tipo : 2}).save();
                //socket.Emitir('add painel', novo);
                res.status(200).json(solarPanel.toObject())
            })
            .catch(err => {
                res.status(500).end(err.message);
            })
    }
    catch(err)
    {
        res.status(500).end(err.message);
    }
});

router.delete('/', (req, res) =>
{
    try
    {
        let id = req.body.id;

        models.SolarPanel.deleteOne({_id : id})
            .then((ok, n, deletedCount) => {
                //socket.Emitir('rem painel', id);
                //new models.EventLog({tempo : new Date(), evento : "Painel solar " +painel.nome+" removido", tipo : 2}).save();
                res.status(200).json({})
            })
            .catch(err => {
                res.status(500).end(err.message)
            })
    }
    catch(err)
    {
        res.status(500).end(err.message)
    }    
});

router.get("/", (req, res) =>
{
    models.SolarPanel.find({}, (err, result) =>
    {
        let arr = []
        lodash.each(result, (panel) => {
            arr.push(panel.toObject());
        })
      res.json({solarPanels : arr});
    });
});

router.delete('/log', (req, res) =>
{
    try
    {
        models.SolarPanel.update({},  {logs: []})
        .then(() => {
            res.status(200).json({});
        })
        .catch(err => {
            res.status(500).end(err.message)
        })
    }
    catch(err) 
    {
        res.status(500).end(err.message)
    }
    
});

router.put('/', (req, res) =>
{
    let id = req.body.id;
    let name = sanitizer.escape(req.body.name); 
    let path = sanitizer.unescapeEntities(req.body.path).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    
    let type = req.body.type;
    let host = sanitizer.escape(req.body.host);


    models.SolarPanel.updateOne({_id : id}, {name : name, host : host, path : path, type : type}, (err, doc) => {
        if(err)
        {
            res.status(500).end(err.message)
        }
        else
        {
            res.status(200).json({});
        }
    })
    
});


module.exports = router;