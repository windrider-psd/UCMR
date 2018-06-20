var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var classesmqtt = require('./models/classes-mqtt.js');
var mongoose = require('mongoose');

var PainelSolar = require('./models/db/PainelSolar');
var LogEventos = require('./models/db/LogEventos');
var ModeloDispositivo = require('./models/db/Dispositivo');


function LimparDB()
  {
      PainelSolar.deleteMany({}, function(err)
      {
        if(err) throw err;
      });
      LogEventos.deleteMany({}, function(err)
      {
        if(err) throw err;
      });
      ModeloDispositivo.deleteMany({}, function(err)
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
  app.locals.versao = "0.6.1";
  app.locals.anoAtual = new Date().getFullYear();
  app.locals.modoDebug = configuracoes.init.debug;


  var portaMQTT = configuracoes.init.mqttport;
  
  mongoose.connect(configuracoes.init.mongourl);
  
  

  PainelSolar.deleteMany({tipo : 0}, function(err)
  {
    if(err) throw err;
  });

  ModeloDispositivo.deleteMany({debug : true}, function(err)
  {
    if(err) throw err;
  });


  if(configuracoes.init.cleardb)
  {
    LimparDB();
    console.log("Base de dados resetada");
  }
  new LogEventos({tempo : new Date(), evento : "UCMR Iniciado", tipo : 0}).save();

  console.log("Intervalo dos Painel Solares: " + configuracoes.init.solarinterval+ " segundos");

  var criadorModulos = require('./models/criardorModulos');
  app.locals.SolarGetter = criadorModulos.CriarModulo("SolarGetter.js", ['--interval', configuracoes.init.solarinterval * 1000, "--mongourl", configuracoes.init.mongourl]);

  app.locals.SolarGetter.on('message', function(mensagem)
  {
    if(mensagem.tipo == "att")
    {
      io.Emitir('att grafico energia', mensagem.conteudo);
    }
    else if(mensagem.tipo == "est")
    {
      io.Emitir("att painel estado", mensagem.conteudo);
    }
    
  });


  var ip = require("ip");
  app.locals.enderecoIP = ip.address();

  app.locals.hardwaresDebug = new Array();


  app.locals.ioPort = configuracoes.init.ioport;

  console.log("Porta Socket.IO: " + app.locals.ioPort);
  console.log("Endereço: " + app.locals.enderecoIP);
  console.log("Modo Debug: " + app.locals.modoDebug);
  console.log("-----------------------");
  var io = require('./models/io.js');
  io.CriarSocket(app);
  app.locals.servidorMosca = new classesmqtt.ServidorMQTT(portaMQTT, configuracoes.init.mongourl, io);
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

