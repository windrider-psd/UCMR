let express = require('express');
let router = express.Router();
const models = require('../models/DBModels')
let sanitizer = require('sanitizer');
let socket = require('../models/SocketIOServer').getIntance()
let globalStorage = require('../services/GlobalStorage')
let lodash = require('lodash')

router.get('/', (req, res) =>
{
    models.EventLog.find({}, (err, logs) =>
    {
        if(err) 
            res.status(500).end(err.message)
        else
            res.status(200).json({logs: logs})
    }).sort('-time');
});


router.delete('/', (req, res) =>
{
    models.EventLog.deleteMany({}, (err, result) =>
    {
        if(err) 
            res.status(500).end(err.message)
        else
            res.status(200).json({})
    })

});


module.exports = router;