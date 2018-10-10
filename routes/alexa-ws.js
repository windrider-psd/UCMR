let express = require('express');
let router = express.Router();
let servidor = require('./../models/ServidorMQTT')
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
    if(servidor.setCargaDipositivoPorNome(params.nome, params.valor == "1"))
    {
      res.status(200).end("")
    }
    else
    {
      res.status(404).end("")
    }
  }
  
})


module.exports = router;
