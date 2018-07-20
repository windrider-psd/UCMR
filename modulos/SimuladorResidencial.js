
var SimuladorModel = require('./../models/db/SimuladorResidencial');
var yargs = require('yargs').argv;
const id = yargs.id;
const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const meses = ['Janeiro','Febereiro','Março','Abril','Maio','Junho','Julho','Augosto','Setembro','Outubro','Novembro','Dezembro'];
var intervaloSolar;

async function SalvarDados(cenario)
{
    for(painel in cenario.paineis)
    {

    }
}

SimuladorModel.findById(id, function(err, cenario)
{
    if(err) throw err;
    intervaloSolar = cenario.duracao_variancia * 60 * 1000;

    setInterval(SalvarDados(cenario), intervaloSolar);
});