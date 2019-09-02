#!/usr/bin/env node

/**
 * Module dependencies.
 */
let croner = require("./../services/Croner")
let yargs = require('yargs').argv
let configuracoes = require('./../ucmr.config')
const session = require('express-session')
const RedisStore = require('connect-redis')(session);
let models = require('./../models/DBModels')
const redis = require('redis').createClient({host : 'localhost', port : 6379});
let mongoose = require('mongoose');
let bcrypt = require('bcrypt')

mongoose.connect(configuracoes.mongourl, (err) => {
  CreateDefaultUser();
});

const armazenadorSessao = new RedisStore({host : 'localhost', port : 6379, client : redis})
const sessaomiddleware = session({
  store : armazenadorSessao,
  resave: true,
  saveUninitialized : false, 
  secret : 'uijn4unip32nur324p23u'});

for(let chave in configuracoes)
{
  configuracoes[chave] = (yargs[chave]) ? yargs[chave] : configuracoes[chave];
}
let portaPrincipal = configuracoes.webport.toString();

console.log("-----------------------");
console.log("Porta Servidor Web: " + portaPrincipal);

let app = require('../app')(sessaomiddleware);

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
    models.Usuario.findOne({}, (err, usuario) => {
      if(err)
      {
        reject(err);
      }
      else if(usuario == null)
      {

        bcrypt.hash(configuracoes.defaultUser.password, 12, (err, encryptedPassword) => {
          models.Usuario.create({username : configuracoes.defaultUser.username, password: encryptedPassword})
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