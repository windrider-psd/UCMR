const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const ServidorMQTT = require('./models/ServidorMQTT')
const ip = require("ip");
const models = require('./models/DBModels')

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const configuracoes = require('./ucmr.config')

let yargs = require('yargs').argv
let {URL} = require('url');
function LimparDB()
{
    models.PainelSolar.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
    models.LogEventos.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
    models.ModeloDispositivo.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
}


function CriarApp(sessionMiddleware)
{
  let paginasRouter = require('./routes/paginas');
  let debugRouter = require('./routes/debug');
  let comandosRouter = require('./routes/comandos');
  let alexaRouter = require('./routes/alexa-ws');
  let app = express();
  app.set('views', path.join(__dirname, 'public'));
  app.set('view engine', 'pug');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json()); 
  app.use(bodyParser.urlencoded({ extended: true })); 
  app.use(sessionMiddleware)
  app.locals.serverdata = {}
  app.locals.serverdata.autor = "UFSM"
  app.locals.serverdata.versao = "0.7.0";
  app.locals.serverdata.anoAtual = new Date().getFullYear();
  app.locals.serverdata.modoDebug = configuracoes.debug;


  let portaMQTT = configuracoes.mqttport;
  

  
  models.PainelSolar.deleteMany({tipo : 0}, function(err)
  {
    if(err) throw err;
  });

  models.ModeloDispositivo.deleteMany({debug : true}, function(err)
  {
    if(err) throw err;
  });


  if(configuracoes.cleardb)
  {
    LimparDB();
    console.log("Base de dados resetada");
  }
  new models.LogEventos({tempo : new Date(), evento : "UCMR Iniciado", tipo : 0}).save();

  console.log("Intervalo dos Painel Solares: " + configuracoes.solarinterval+ " segundos");

  app.locals.serverdata.enderecoIP = ip.address();
  let criadorModulos = require('./models/CriadorModulos');
  app.locals.SolarGetter = criadorModulos.CriarFork("SolarGetter.js", ['--interval', configuracoes.solarinterval * 1000, "--mongourl", configuracoes.mongourl]);
  /*let py = criadorModulos.CriarSpawn("classificador.py", [configuracoes.city, configuracoes.state, configuracoes.adminuser, configuracoes.adminpassword, app.locals.enderecoIP, configuracoes.mqttport]);

  py.stdout.on('data', function(msg)
  {
    console.log("py:" + msg);
  });*/


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

  app.locals.hardwaresDebug = new Array();
  app.locals.serverdata.ioPort = configuracoes.ioport;
  console.log("Porta Socket.IO: " + app.locals.serverdata.ioPort);
  console.log("Endereço: " + app.locals.serverdata.enderecoIP);
  console.log("Modo Debug: " + app.locals.serverdata.modoDebug);
  console.log("-----------------------");
  let io = require('./models/SocketIOServer').getIntance();
  io.CriarSocket(app);

  ServidorMQTT.setUp(portaMQTT, configuracoes.mongourl, configuracoes.mqttuser, configuracoes.mqttpassword, configuracoes.adminuser, configuracoes.adminpassword);
  app.locals.io = io;

  app.use('/', paginasRouter);
  app.use((req, res, next) => {
    if(typeof(req.headers.referer) != 'undefined')
    {
      let url = new URL(req.headers.referer)
      let validPort = (configuracoes.webport == "80" && url.port == "") || url.port == configuracoes.webport
      let validHost = (url.host == configuracoes.host)
      let validIP = (url.host == ip.address() || (configuracoes.mode == "development" && url.host == "127.0.0.1"))
      if(validPort && (validHost || validIP))
      {
        next()
      }
      else
      {
        res.status(400).end("Invalid request.")
      }
    }
    else
    {
      //res.status(400).end("Invalid request.")
      next();
    }
  })
  app.use('/usuarios', require('./routes/usuarios'))
  app.use('/debug', debugRouter);
  app.use('/comandos', comandosRouter);
  app.use('/alexa-ws', alexaRouter)
  

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json(err.message);
  });
  if(!yargs.nowebpack)
  {
    app.use(require("webpack-dev-middleware")(compiler, {
      publicPath: __dirname + '/public/dist/', writeToDisk : true
    }));
    app.use(require("webpack-hot-middleware")(compiler));
  }
  return app;
}


module.exports = CriarApp;

