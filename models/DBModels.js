let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * @typedef DeviceDocument
 * @property {string} deviceId The device's Id. Usually it should be the MAC address. 
 * @property {string} name The device's display name
 * @property {Array<String>} topics All the topics the device is subscribed
 * @property {Array.<{sensorType: String, gpio: String}>} sensors All the sensors attached to the device
 * @property {Boolean} debug Is the device a debug device?
 * @property {Boolean} deviceState The device's relay state. False if closed or nonexistent, true if opened.
 * @property {Number} deviceType The type of the device.
 * @property {Function} save Saves the document on the database. Retunrs a promise.
 */

let deviceSchema = new Schema(
{
	deviceId:
	{
		type: String,
		required: true
	},
	name:
	{
		type: String,
		required: true
	},
	topics: [
	{
		type: String
	}],
	sensors : 
	[
		{
			type : String,
			gpio : {type : String}
		},
	],
	sensorData : 
	[
		{
			type : String,
			time: Date,
			value : String
		},
	],
	isDebug:
	{
		type: Boolean,
		default: false
	},
	deviceState : 
	{
		type: Boolean,
		default: false
	},
	deviceType: Number
});

let userSchema = new Schema({
	username : {
		type : String,
		required : true
	},
	password : 
	{
		type : String,
		required : true
	},
	admin : 
	{
		type : Boolean,
		required : true,
		default : false
	}
})


let panelSchema = new Schema(
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
	state:
	{
		type: Boolean,
		default: true
	}
});


let logSchema = new Schema(
{
	time:
	{
		type: Date,
		required: true
	},
	event:
	{
		type: String,
		required: true
	},
	type:
	{
		type: String,
		required: true
	} //0 Geral, 1 Dispositivos, 2 Painel Solar
});


let Device = mongoose.model('Device', deviceSchema);
let EventLog = mongoose.model('EventLog', logSchema);
let SolarPanel = mongoose.model('SolarPanel', panelSchema);
let user = mongoose.model('User', userSchema);

module.exports = {
	SolarPanel: SolarPanel,
	EventLog: EventLog,
	Device: Device,
	User : user
}