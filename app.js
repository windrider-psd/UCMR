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
app.locals.versao = "0.3.1";
app.locals.anoAtual = new Date().getFullYear();

if(typeof(process.argv[2]) !== 'undefined' && (process.argv[2].toString().toLowerCase() == 'd' || process.argv[2].toString().toLowerCase() == 'debug'))
{
  app.locals.modoDebug = true;
}
else 
{
  app.locals.modoDebug = false;
}

var ip = require("ip");
app.locals.enderecoIP = ip.address();

app.locals.hardwaresDebug = new Array();
app.locals.servidorMosca = new classesmqtt.ServidorMQTT();
app.locals.ioPort = 8080;
var io = require('./models/io.js')(app);

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
