var criador = require('../models/criardorModulos.js');
var redis = require("redis");
var sql = require('sqlite-sync');
sql.connect("base.db");
var clienteRedis = redis.createClient();
var sgObjects = new Array();
let producao_dia;
var appobj;   
class SGClass
{
    //pac = Energia produzida agora
    //de = Day energy = energia produzina no dia
    constructor(objetosg, pac, de)
    {
        this.objetosg = objetosg;
        this.pac = 0;
        this.de = 0;
        var pai = this;
        this.objetosg.on("message", function(data)
        {
            pai.pac = data.pac;
            pai.setProducaoDia(data.de); 
        });
        
    }
    setProducaoDia(producao)
    {
        producao_dia = producao;
    }
     
}
var producaoPeriodo = 0;
var setProducao = function SetProducaoAtual()
{
    var total = 0;
    for(var i = 0; i < sgObjects.length; i++)
    {
        total+= sgObjects[i].pac.valor;
    }
    clienteRedis.set("producao-atual", total + " W");
    clienteRedis.set("producao-dia", producao_dia + " Wh");
    producaoPeriodo += total;
    appobj.locals.io.Emitir("att prod energia", {atual: total + " W", dia: producao_dia + " Wh"});
}

setInterval(setProducao, 10000); //10 segundos
setInterval(function(){
    sql.insert("log_producao", {valor : producaoPeriodo, unidade : "Wh"});
    producaoPeriodo = 0;
}, 60000); //1 minuto


function CriarSolarGetters(opcoes, app)
{
    appobj = app;
    for(var i = 0; i < opcoes.length; i++)
    {
        var sg = criador.CriarModulo("SolarGetter.js", ["--host", opcoes[i].host, "--path", opcoes[i].path]);
        sgObjects.push(new SGClass(sg));
    }
}
module.exports = CriarSolarGetters;


