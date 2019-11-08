const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const ip = require("ip");
const models = require('./models/DBModels')

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const config = require('./ucmr.config')

let yargs = require('yargs').argv
let {URL} = require('url');


function ClearDatabase()
{
    models.SolarPanel.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
    models.EventLog.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
    models.Device.deleteMany({}, function(err)
    {
      if(err) throw err;
    });
}


function CreateApp(sessionMiddleware)
{
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
  app.locals.serverdata.modoDebug = config.debug;
  
  models.SolarPanel.deleteMany({tipo : 0}, function(err)
  {
    if(err) throw err;
  });

  models.Device.deleteMany({debug : true}, function(err)
  {
    if(err) throw err;
  });


  if(config.cleardb)
  {
    ClearDatabase();
    console.log("Base de dados resetada");
  }
  //new models.EventLog({tempo : new Date(), evento : "UCMR Iniciado", tipo : 0}).save();

  console.log("Intervalo dos Painel Solares: " + config.solarInterval+ " segundos");

  app.locals.serverdata.enderecoIP = ip.address();
  let criadorModulos = require('./models/CriadorModulos');
  
  //app.locals.SolarGetter = criadorModulos.CriarFork("SolarGetter.js", ['--interval', config.solarInterval * 1000, "--mongourl", config.mongourl]);
  /*let py = criadorModulos.CriarSpawn("classificador.py", [configuracoes.city, configuracoes.state, configuracoes.adminuser, configuracoes.adminpassword, app.locals.enderecoIP, configuracoes.mqttport]);

  py.stdout.on('data', function(msg)
  {
    console.log("py:" + msg);
  });*/


  /*app.locals.SolarGetter.on('message', function(mensagem)
  {
    if(mensagem.tipo == "att")
    {
      io.Emit('att grafico energia', mensagem.conteudo);
    }
    else if(mensagem.tipo == "est")
    {
      io.Emit("att painel estado", mensagem.conteudo);
    }
    
  });*/

  app.locals.serverdata.ioPort = config.ioPort;
  console.log("Porta Socket.IO: " + app.locals.serverdata.ioPort);
  console.log("Endereço: " + app.locals.serverdata.enderecoIP);
  console.log("Modo Debug: " + app.locals.serverdata.modoDebug);
  console.log("-----------------------");
  let io = require('./models/SocketIOServer').getIntance();
  io.CreateSocket(app);
  

  app.locals.io = io;

  app.use('/',  require('./routes/pages'));
  app.use((req, res, next) => {
    if(typeof(req.headers.referer) != 'undefined')
    {
      let url = new URL(req.headers.referer)
      let validPort = (config.webport == "80" && url.port == "") || url.port == config.webport
      let validHost = (url.host == config.host)
      let validIP = (url.host == ip.address() || (config.mode == "development" && url.host == "127.0.0.1"))
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
  app.use('/users', require('./routes/users'))
  app.use('/debug', require('./routes/debug'));
  app.use('/devices', require('./routes/devices'));
  app.use('/logs', require('./routes/logs'));
  app.use('/solarpanels', require('./routes/solarpanels'));

  //app.use('/comandos', comandosRouter);
  //app.use('/alexa-ws', alexaRouter)
  

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


module.exports = CreateApp;

