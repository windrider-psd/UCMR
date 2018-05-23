const argv = require('yargs').argv;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');


const JSON = require('circular-json');
var classesmqtt = require('./models/classes-mqtt.js');

var paginasRouter = require('./routes/paginas');
var debugRouter = require('./routes/debug');
var comandosRouter = require('./routes/comandos');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.locals.autor = "UFSM"
app.locals.versao = "0.4.0";
app.locals.anoAtual = new Date().getFullYear();
if(argv.debug)
{
  app.locals.modoDebug = true;
}
else 
{
  app.locals.modoDebug = false;
}

var portaMQTT;

if(argv.mqttport)
{
  portaMQTT = argv.mqttport;
}
else 
{
  portaMQTT = 1883;
}


var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ucmr');
var LogProducaoPainel = require('./models/db/LogProducaoPainel');
var LogEventos = require('./models/db/LogEventos');
function LimparDB()
{
    LogProducaoPainel.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
    LogEventos.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
}

LogProducaoPainel.deleteMany({debug : true}, function(err)
{
  if(err) throw err;
});


if(argv.cleardb)
{
  LimparDB();
  console.log("Base de dados resetada");
}
new LogEventos({tempo : new Date(), evento : "UCMR Iniciado"}).save();

var sgoption = new Array();
app.locals.solarinterval = (argv.solarinterval) ? argv.solarinterval * 1000 : 180000; //padrão 3 minutos
console.log("Intervalo dos Painel Solares: " + app.locals.solarinterval / 1000 + " segundos");

sgoption.push({host : "200.132.36.179", path : "/solar_api/v1/GetInverterRealtimeData.cgi?Scope=Device&DeviceId=1&DataCollection=CommonInverterData" });
var controllersolar = require("./models/SolarGetterContoller.js");

app.locals.ControladorSolar = new controllersolar(app)
app.locals.ControladorSolar.CriarSolarGetters(sgoption);


var ip = require("ip");
app.locals.enderecoIP = ip.address();

app.locals.hardwaresDebug = new Array();
app.locals.servidorMosca = new classesmqtt.ServidorMQTT(portaMQTT)

if(argv.ioport)
  app.locals.ioPort = argv.ioport;
else
  app.locals.ioPort = 8080;

console.log("Porta Socket.IO: " + app.locals.ioPort);
console.log("Endereço: " + app.locals.enderecoIP);
console.log("Modo Debug: " + app.locals.modoDebug);
console.log("-----------------------");
var io = require('./models/io.js');
io.CriarSocket(app);
app.locals.io = io;

app.use('/', paginasRouter);
app.use('/debug', debugRouter);
app.use('/comandos', comandosRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('layouts/error');
});

module.exports = app;

