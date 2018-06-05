var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var dispositivoSchema = new Schema({
    idDispositivo : {type : String, required : true},
    nome : {type : String, required : true},
    topicos : [{type : String}],
    debug : {type : Boolean, default : false}
});

// the schema is useless so far
// we need to create a model using it
var Dispositivo = mongoose.model('Dispositivos', dispositivoSchema);

// make this available to our users in our Node applications
module.exports = Dispositivo;