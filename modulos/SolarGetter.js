let mongoose = require('mongoose');
let models = require('./../models/DBModels')
let yargs = require('yargs').argv;
let http = require('http');

mongoose.connect(yargs.mongourl, {useNewUrlParser: true});

let intervalo = yargs.interval;
let debug_id_counter = 1;

async function SalvarLog(objeto) //Objeto models.PainelSolar
{
    let energiaAgora;
    let tempoagora = new Date();

    try
    {
        if(objeto.tipo != 0)
        {
            let options = {
                hostname: objeto.host,
                port: 80,
                path: objeto.path,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
                };
                
                let req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (data) {
                    try
                    {
                        let obj = JSON.parse(data);
                        energiaAgora = obj.Body.Data.PAC.Value;
                        objeto.logs.push({valor : energiaAgora, tempo : tempoagora});
                        let mudanca = false;
                        if(objeto.estado == false)
                        {
                            objeto.estado = true;
                            mudanca = true;
                        }
                        objeto.save(function(err)
                        {
                            if(err) 
                            {
                                console.error(err);
                                if(objeto.estado == true)
                                {
                                    new models.LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")" , tipo : 2}).save();
                                    objeto.estado =  false; 
                                    objeto.save();
                                }
                                
                                if(mudanca)
                                {
                                    process.send({tipo : 'est', conteudo : {id : objeto._id, estado : false}});
                                }
                            }
                            else
                            {
                                process.send({tipo : 'att', conteudo : { id : objeto._id, valor : energiaAgora, tempo : tempoagora}});
                                if(mudanca)
                                {
                                    process.send({tipo : 'est', conteudo : {id : objeto._id, estado : objeto.estado}});
                                    new models.LogEventos({tempo : new Date(), evento : "Captura dos dados no painel solar " + objeto.nome + "(" + objeto._id + ") de volta ao normal" , tipo : 2}).save();
                                }
                                
                            }
                        });
                    }
                    catch(err)
                    {
                        if(objeto.estado == true)
                        {
                            new models.LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")" , tipo : 2}).save();
                            process.send({tipo : 'est', conteudo : {id : objeto._id, estado : false}});
                        }
                        objeto.estado =  false; 
                        objeto.save();
                        console.error("Erro ao capturar dados do painel solar "+objeto.nome );
                        
                    }

                });
                });
                req.on('error', function(e) {
                console.log(e)
                });
                req.end();
        }
        else
        {
            energiaAgora = (typeof(objeto.logs[objeto.logs.length - 1]) != 'undefined') ? objeto.logs[objeto.logs.length - 1].valor : 0;
            let variacao = Math.floor(Math.random() * (400 - (-400) + 1) + (-400));
            energiaAgora += variacao;
            if(energiaAgora < 0)
            {
                energiaAgora = 0;
            }
            
            objeto.logs.push({valor : energiaAgora, tempo :tempoagora});
            if(objeto.estado == false)
            {
                objeto.estado = true;
            }
            objeto.save(function(err)
            {
                if(err) console.log(err)
                else
                {
                     process.send({tipo : 'att', conteudo : { id : objeto._id, valor : energiaAgora, tempo : tempoagora}});
                     process.send({tipo : 'est', conteudo : {id : objeto._id, estado : true}});
                }
            });
            
        }

        return energiaAgora;
    }
    catch(err)
    {
        new models.LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")", tipo : 2}).save();
    }
} 

    
function CriarDebug()
{
    new models.PainelSolar({nome : "debug_"+debug_id_counter, tipo : 0, logs : []}).save();
    debug_id_counter++;
}   

setInterval(function(){
    models.PainelSolar.find({}, function(err, resultado)
    {
        if(err) console.log(err)
        else
        {
            if(resultado)
            {
                for(let i = 0; i < resultado.length; i++)
                {
                    SalvarLog(resultado[i]);
                }
            }
        }
       
    });

}, intervalo);


process.on("message", function (data)
{

    if(data.comando == 1)
    {
        CriarDebug();
    }
});



