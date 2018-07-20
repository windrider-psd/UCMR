var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var simuladorSchema = new Schema({
  duracao: Number,
  variancia : Number,
  duracao_variancia : Number,
  salas : [],
  paineis : [],
  logsPaineis : [],
//  horario : {type : Date, default : new Date()},
});

var sim = mongoose.model('SimuladorResidencial', simuladorSchema);
module.exports = sim;