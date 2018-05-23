var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
    tempo : {type : Date, required : true},
    evento : {type : String, required : true}
});

// the schema is useless so far
// we need to create a model using it
var LogEventos = mongoose.model('LogEventos', logSchema);

// make this available to our users in our Node applications
module.exports = LogEventos;