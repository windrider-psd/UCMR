var mongoose = require('mongoose');
var PainelSolar = require('./../models/db/PainelSolar');
var LogEventos = require('./../models/db/LogEventos')
var yargs = require('yargs').argv;
var http = require('http');
mongoose.connect(yargs.mongourl);
var intervalo = yargs.interval;
var debug_id_counter = 1;

async function SalvarLog(objeto) //Objeto PainelSolar
{
    var energiaAgora;
    var tempoagora = new Date();

    try
    {
        if(objeto.tipo != 0)
        {
            var options = {
                hostname: objeto.host,
                port: 80,
                path: objeto.path,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
                };
                
                var req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (data) {
                    try
                    {
                        var obj = JSON.parse(data);
                        energiaAgora = obj.Body.Data.PAC.Value;
                        objeto.logs.push({valor : energiaAgora, tempo : tempoagora});
                        var mudanca = false;
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
                                new LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")" }).save();
                                objeto.estado =  false; 
                                objeto.save();
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
                                }
                                
                            }
                        });
                    }
                    catch(err)
                    {
                        new LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")" }).save();
                        if(objeto.estado == true)
                        {
                            process.send({tipo : 'est', conteudo : {estado : false}});
                        }
                        objeto.estado =  false; 
                        objeto.save();
                        console.error("Erro ao capturar dados do painel solar "+objeto.nome );
                        
                    }
                    

                });
                });
                req.on('error', function(e) {
                throw e.message;
                });
                req.end();
        }
        else
        {
            energiaAgora = (typeof(objeto.logs[objeto.logs.length - 1]) != 'undefined') ? objeto.logs[objeto.logs.length - 1].valor : 0;
            var variacao = Math.floor(Math.random() * (400 - (-400) + 1) + (-400));
            energiaAgora += variacao;
            if(energiaAgora < 0)
            {
                energiaAgora = 0;
            }
            
            objeto.logs.push({valor : energiaAgora, tempo :tempoagora});
            objeto.save(function(err)
            {
                if(err) throw err;
                else
                {
                     process.send({tipo : 'att', conteudo : { id : objeto._id, valor : energiaAgora, tempo : tempoagora}});
                }
            });
            
        }

        return energiaAgora;
    }
    catch(err)
    {
        new LogEventos({tempo : new Date(), evento : "Erro ao capturar dados do painel solar: " + objeto.nome + "(" + objeto._id + ")" }).save();
    }
} 

    
function CriarDebug()
{
    new PainelSolar({nome : "debug_"+debug_id_counter, tipo : 0, logs : []}).save();
    debug_id_counter++;
}   

setInterval(function(){
    var agora = new Date();
    PainelSolar.find({}, function(err, resultado)
    {
        if(err) throw err;

        if(resultado)
        {
            for(var i = 0; i < resultado.length; i++)
            {
                SalvarLog(resultado[i]);
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



