var criador = require('../models/criardorModulos.js');
var redis = require("redis");
var sql = require('sqlite-sync');
sql.connect("base.db");
var clienteRedis = redis.createClient();
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
        this.id = 0;
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

var setProducao = function SetProducaoAtual()
{
    var total = 0;
    for(var i = 0; i < sgObjects.length; i++)
    {
        total+= sgObjects[i].pac.valor;
    }
    clienteRedis.set("producao-atual", total + " W");
    clienteRedis.set("producao-dia", producao_dia + " Wh");
    appobj.locals.io.Emitir("att prod energia", {atual: total + " W", dia: producao_dia + " Wh"});
}

setInterval(setProducao, 10000); //10 segundos
var debug_id_counter = 1;

class SolarGetterController
{
    constructor(app)
    {
        appobj = app;
        intervalo = app.locals.solarinterval;
        setInterval(function(){
            var agora = moment().format('YYYY-mm-dd h:mm:ss');
            
            var totalcache = 0;
            for(var i = 0; i < sgObjects.length; i++)
            {
                //total += sgObjects[i].pac.valor;
                if(sgObjects[i].debug == 0)
                {
                    sql.insert("log_producao_painelsolar", {tempo : agora, id : sgObjects[i].id, valor : sgObjects[i].pac.valor});
                }
                    
                else
                {
                    sql.insert("log_producao_painelsolar", {tempo : agora, id : sgObjects[i].id, valor : sgObjects[i].pac.valor, debug : 1});
                }
                totalcache += sgObjects[i].pac.valor;
                    
            }
            sql.insert("log_producao", {tempo : agora, valor : totalcache});
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
        sgObjects.push(new SGClass(sg, 1));
        debug_id_counter++;
    }

    Paineis()
    {
        return sgObjects;
    }
}




module.exports = SolarGetterController;


