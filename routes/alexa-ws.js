var express = require('express');
var router = express.Router();

//Ligar ou desligar dispositivo
router.get('/turn-disp', (req, res) => {
  /**
   * @type {{valor : boolean, nome : string}}
   */
  let params = req.query
  if(!params.valor || (params.valor != '0' && params.valor != '1'))
    res.status(400).end("Invalid value")
  else if(!params.nome)
    res.status(400).end("Invalid device name")
  else
  {
    params.nome = params.nome.toLowerCase()
   console.log(params.valor);
    let dispo = req.app.locals.servidorMosca.GetSimpleDisp()
    debugger
    for(let i = 0; i < dispo.length; i++)
    {
      if(params.nome == dispo[i].nome)
      {
        let disp = req.app.locals.servidorMosca.GetDispositivo(filtro);
        disp.Estado = params.valor == "1"
        req.app.locals.servidorMosca.PublicarMensagem(disp.codigo,'tp\n'+params.valor)
        let mensagem = {codigos : new Array(dispo[i].codigo), valor : params.valor}
        req.app.locals.io.Emitir('att estado sonoff', mensagem)
        res.status(200).end((params.valor == "1") ? "Device turned on" : "Device turned off")
        return
      }
    }
    res.status(200).end("No device with the name " + params.nome + " has been found")
  }
  
})


module.exports = router;
