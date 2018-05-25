var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var painelSchema = new Schema({
  nome: String,
  host : String,
  path : String,
  logs : [{valor : Number, tempo : Date}],
  tipo : Number //0 = debug, 1 = Fronius
});

var PainelSolar = mongoose.model('PainelSolar', painelSchema);

module.exports = PainelSolar;