const argv = require('yargs').argv;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
const JSON = require('circular-json');
var classesmqtt = require('./models/classes-mqtt.js');
var mongoose = require('mongoose');

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

//configuracoes = Objeto JSON de bin/configuracoes.json
function CriarApp(configuracoes)
{
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
  app.locals.versao = "0.5.0";
  app.locals.anoAtual = new Date().getFullYear();
  if(argv.debug)
  {
    app.locals.modoDebug = true;
  }
  else 
  {
    app.locals.modoDebug = false;
  }

  var portaMQTT = configuracoes.init.mqttport;
  
  mongoose.connect(configuracoes.init.mongourl);
  
  

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
  app.locals.solarinterval = configuracoes.init.solarinterval * 1000;
  console.log("Intervalo dos Painel Solares: " + configuracoes.init.solarinterval+ " segundos");

  
  for(var i = 0; i < configuracoes.addon.solarpanels.length; i++)
  {
      sgoption.push({host : configuracoes.addon.solarpanels[i].host, path : configuracoes.addon.solarpanels[i].path});
  }


  var controllersolar = require("./models/SolarGetterContoller.js");

  app.locals.ControladorSolar = new controllersolar(app)
  app.locals.ControladorSolar.CriarSolarGetters(sgoption);


  var ip = require("ip");
  app.locals.enderecoIP = ip.address();

  app.locals.hardwaresDebug = new Array();
  app.locals.servidorMosca = new classesmqtt.ServidorMQTT(portaMQTT, configuracoes.init.mongourl);


  app.locals.ioPort = configuracoes.init.ioport;

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
  return app;
}


module.exports = CriarApp;

