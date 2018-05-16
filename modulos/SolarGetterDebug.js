const argv = require('yargs').argv;
var intervalo = (argv.intervalo && typeof(argv.intervalo) == 'number') ? argv.intervalo : 5000;

var energiaAgora = 0;
var energiaDia = 0;
var id = argv.id;
  setInterval(() => {
    var variacao = Math.floor(Math.random() * (400 - (-400) + 1) + (-400));
    energiaAgora += variacao;
    if(energiaAgora < 0)
    {
      energiaAgora = 0;
    }

    energiaDia += energiaAgora; 

    var mensagem = {pac : {valor : energiaAgora, unidade : "W"}, de : energiaDia, id : id };
    process.send(mensagem);

  }, intervalo);  
    
