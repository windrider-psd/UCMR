var criador = require('../models/criardorModulos.js');
var LogProducaoPainel = require('./db/LogProducaoPainel');
var LogEventos = require('./db/LogEventos');
var sgObjects = new Array();
let producao_dia;
var appobj;   
var moment = require('moment');
var intervalo = 5000;
class SGClass
{
    //pac = Energia produzida agora
    //de = Day energy = energia produzina no dia
    constructor(objetosg, debug)
    {
        this.objetosg = objetosg;
        this.pac = 0;
        this.de = 0;
        this.debug = debug;
        this.id = null;
        var pai = this;
        this.objetosg.on("message", function(data)
        {
            pai.pac = data.pac;
            pai.setProducaoDia(data.de);
            pai.id = data.id; 
        });
        
    }
    setProducaoDia(producao)
    {
        producao_dia = producao;
    }
     
}
var debug_id_counter = 1;

class SolarGetterController
{
    constructor(app)
    {
        appobj = app;
        intervalo = app.locals.solarinterval;
        setInterval(function(){
            var agora = new Date();
            LogProducaoPainel.find({}, function(err, resultado) {
                if (err) throw err;
                
                if(!resultado)
                {
                    for(var i = 0; i < sgObjects.length; i++)
                    {
                        if(sgObjects[i].id != null)
                        {
                            var objeto = sgObjects[i];
                            var logsave = new LogProducaoPainel({id_painel : objeto.id, debug : objeto.debug == 1, logs : [{valor : objeto.pac.valor, tempo : agora}]});
                            logsave.save(function(err)
                            {
                                if(err) throw err;
                            });
                        }
                        
                    }
                    
                }
                else
                {
                    for(var i = 0; i < sgObjects.length; i++)
                    {
                        var esta = false;
                        var objeto = sgObjects[i];
                        for(var j = 0; j < resultado.length; j++)
                        {
                            if(sgObjects[i].id == resultado[j].id_painel)
                            {
                                esta = true;
                                resultado[j].logs.push({valor : objeto.pac.valor, tempo : agora});
                                resultado[j].save(function(err)
                                {
                                    if(err) throw err;
                                });
                                break;
                            }
                        }
                        if(!esta)
                        {
                            var logsave = new LogProducaoPainel({id_painel : objeto.id, debug : objeto.debug == 1, logs : [{valor : objeto.pac.valor, tempo : agora}]});
                            logsave.save(function(err)
                            {
                                if(err) throw err;
                            });
                        }
                    }
                }
                

              });

        }, intervalo);
    }
    CriarSolarGetters(opcoes)
    {
        
        for(var i = 0; i < opcoes.length; i++)
        {
            var sg = criador.CriarModulo("SolarGetter.js", ["--host", opcoes[i].host, "--path", opcoes[i].path]);
            sgObjects.push(new SGClass(sg, 0));
        }
    }

    CriarSolarGetterDebug()
    {
        var sg = criador.CriarModulo("SolarGetterDebug.js", ['--id', "debug_"+debug_id_counter]);
        new LogEventos({tempo : new Date(), evento : "Painel solar Debug debug_"+debug_id_counter+" Adicionado"}).save();
        sgObjects.push(new SGClass(sg, 1));
        debug_id_counter++;
        
    }

    Paineis()
    {
        return sgObjects;
    }
}




module.exports = SolarGetterController;


