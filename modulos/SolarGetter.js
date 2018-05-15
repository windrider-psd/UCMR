const argv = require('yargs').argv;
var http = require("http");
var intervalo = (argv.intervalo && typeof(argv.intervalo) == 'number') ? argv.intervalo : 5000;

if(argv.host && argv.path)
{   
  setInterval(() => {
    var options = {
      hostname: argv.host,
      port: 80,
      path: argv.path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (data) {
          var obj = JSON.parse(data);
          var energiaAgora = obj.Body.Data.PAC;
          var mensagem = {pac : {valor : energiaAgora.Value, unidade : energiaAgora.Unit}, de : obj.Body.Data.DAY_ENERGY.Value};
          process.send(mensagem);
      });
    });
    req.on('error', function(e) {
      throw e.message;
    });
    req.end();
  }, intervalo);  
    
}
