var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  id_painel: String,
  logs : [{valor : String, tempo : Date}],
  debug : Boolean
});

// the schema is useless so far
// we need to create a model using it
var LogProducao = mongoose.model('LogProducao', logSchema);

// make this available to our users in our Node applications
module.exports = LogProducao;