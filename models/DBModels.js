let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let dispositivoSchema = new Schema(
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
			gpio : {type : String}
		}
	],
	debug:
	{
		type: Boolean,
		default: false
	}
});

let simuladorSchema = new Schema(
{
	duracao: Number,
	variancia: Number,
	duracao_variancia: Number,
	salas: [],
	paineis: [],
	logsPaineis: [],
	//  horario : {type : Date, default : new Date()},
});

let painelSchema = new Schema(
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


let logSchema = new Schema(
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


let Dispositivo = mongoose.model('Dispositivos', dispositivoSchema);
let LogEventos = mongoose.model('LogEventos', logSchema);
let PainelSolar = mongoose.model('PainelSolar', painelSchema);
let sim = mongoose.model('SimuladorResidencial', simuladorSchema);


module.exports = {
	SimuladorResidencial: sim,
	PainelSolar: PainelSolar,
	LogEventos: LogEventos,
	ModeloDispositivo: Dispositivo
}