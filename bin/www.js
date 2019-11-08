#!/usr/bin/env node

/**
 * Module dependencies.
 */
let croner = require("./../services/Croner")
let yargs = require('yargs').argv
let config = require('./../ucmr.config')
const session = require('express-session')
const RedisStore = require('connect-redis')(session);
let models = require('./../models/DBModels')
const redis = require('redis').createClient({host : 'localhost', port : 6379});
let mongoose = require('mongoose');
let bcrypt = require('bcrypt')
let socketioserver = require('./../models/SocketIOServer').getIntance();
let globalStorage = require('./../services/GlobalStorage')

mongoose.connect(config.mongourl, {useNewUrlParser : true, useCreateIndex : true, user : config.mongoUser, pass : config.mongoPass}, (err) => {
  CreateDefaultUser();
})



const armazenadorSessao = new RedisStore({host : 'localhost', port : 6379, client : redis})
const sessaomiddleware = session({
  store : armazenadorSessao,
  resave: true,
  saveUninitialized : false, 
  secret : 'uijn4unip32nur324p23u'});

for(let chave in config)
{
  config[chave] = (yargs[chave]) ? yargs[chave] : config[chave];
}
let portaPrincipal = config.webport.toString();

console.log("-----------------------");
console.log("Porta Servidor Web: " + portaPrincipal);

let app = require('../app')(sessaomiddleware);

let HuskyBroker = require("./../models/HuskyBroker")

let brokerInstance = new HuskyBroker.HuskyServer(config.mongourl, "", "", config.mqttPort, config.mqttUser, config.mqttPassword, config.adminadminuser, config.mqttAdminPassword);
  //ServidorMQTT.setUp(portaMQTT, configuracoes.mongourl, configuracoes.mqttuser, configuracoes.mqttpassword, configuracoes.adminuser, configuracoes.adminpassword);
  

brokerInstance.AddConnectionObserver((device, isConnected) =>{
  let getSimpleDeviceList = () => {
    let arr = new Array();
    for (let i = 0; i < brokerInstance.connectedDevices.length; i++)
    {
      arr.push(brokerInstance.connectedDevices[i].toObject());
    }
    return arr;
  }
  let msg = getSimpleDeviceList();

  socketioserver.Emit("update devices", msg);
  socketioserver.Emit("update topics", msg);
});

brokerInstance.AddDeviceStateObserver((device, newState) => {
    let message = {
      deviceId: device.deviceId,
      value: newState
    };
    socket.Emit('update device state', message);
})

globalStorage.huskyServer = brokerInstance

let debug = require('debug')('startapp:server');
let http = require('http');

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || portaPrincipal);
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  croner.start();
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

function CreateDefaultUser()
{
  return new Promise((resolve, reject) => {
    models.User.findOne({}, (err, usuario) => {
      if(err)
      {
        reject(err);
      }
      else if(usuario == null)
      {

        bcrypt.hash(config.interfaceDefaultUser.password, 12, (err, encryptedPassword) => {
          models.User.create({username : config.interfaceDefaultUser.username, password: encryptedPassword, admin : true})
          .then(usuarioCriado => {
            resolve(usuarioCriado)
          })
          .catch((err) => {
            reject(err);
          })
        })
        
      }
      else
      {
        resolve(usuario);
      }
    })
  })
  
}