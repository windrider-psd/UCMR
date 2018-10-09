let cron = require('node-cron');
let LogEventos = require('./db/LogEventos');
module.exports = cron.schedule('0 0 0 * * *', () => {
    LogEventos.deleteMany({}, function(err) {
        if(err)
            console.log(err)
    })
})