var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dispositivoSchema = new Schema(
{
	idDispositivo:
	{
		type: String,
		required: true
	},
	nome:
	{
		type: String,
		required: true
	},
	topicos: [
	{
		type: String
	}],
	sensores : 
	[
		{
			tipo : String,
			gpio : String
		}
	],
	debug:
	{
		type: Boolean,
		default: false
	}
});

var simuladorSchema = new Schema(
{
	duracao: Number,
	variancia: Number,
	duracao_variancia: Number,
	salas: [],
	paineis: [],
	logsPaineis: [],
	//  horario : {type : Date, default : new Date()},
});

var painelSchema = new Schema(
{
	nome: String,
	host: String,
	path: String,
	logs: [
	{
		valor: Number,
		tempo: Date
	}],
	tipo: Number, //0 = debug, 1 = Fronius
	estado:
	{
		type: Boolean,
		default: true
	}
});


var logSchema = new Schema(
{
	tempo:
	{
		type: Date,
		required: true
	},
	evento:
	{
		type: String,
		required: true
	},
	tipo:
	{
		type: String,
		required: true
	} //0 Geral, 1 Dispositivos, 2 Painel Solar
});


var Dispositivo = mongoose.model('Dispositivos', dispositivoSchema);
var LogEventos = mongoose.model('LogEventos', logSchema);
var PainelSolar = mongoose.model('PainelSolar', painelSchema);
var sim = mongoose.model('SimuladorResidencial', simuladorSchema);


module.exports = {
	SimuladorResidencial: sim,
	PainelSolar: PainelSolar,
	LogEventos: LogEventos,
	ModeloDispositivo: Dispositivo
}