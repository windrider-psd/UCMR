let $ = require('jquery')
let utils = require('../../generic/utils')
let observer = require('./../../generic/observer')

let gets = utils.ParseGET()
let codigo;
if(typeof(gets.codigo) != 'undefined' || isNaN(gets.codigo))
{
    $.ajax({
        url : '/comandos/sonoff/get-dispositivo',
        method : 'GET',
        data : {codigo : gets.codigo},
        dataType : 'JSON',
        success : function(dispositivo)
        {
            $("#row-debug p").text(dispositivo.idDispositivo);
            $("#nome-dispositivo").text(dispositivo.nome)
            $("input[name='codigo']").val(dispositivo.idDispositivo)
            codigo = dispositivo.idDispositivo
            GetTopicos();
        },
        error : function (err)
        {
            utils.GerarNotificacao(err.responseText, "danger");
        }
    })
}
else
{
    utils.GerarNotificacao("Device not found")
}

$("#form-alterar-nome").on('submit', function()
{
    var info = $(this).serialize();
    var nome = $('input[name="nome"]', $(this)).val(); 

    $.ajax({
        url : '/comandos/sonoff/alterarNome',
        method : 'POST',
        data : info,
        dataType : 'JSON',
        success : function(resposta)
        {
            utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);          
        },
        error : function (a)
        {
            utils.GerarNotificacao(a.responseText, "danger");
        }
        
    });
});
$("#form-adicionar-topico").on('submit', function()
{
    var info = $(this).serialize();
    var nome = $('input[name="topico"]', $(this)).val(); 
    $.ajax({
        url : '/comandos/sonoff/inscreverTopico',
        method : 'POST',
        data : info,
        dataType : 'JSON',
        success : function(resposta)
        {
            utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
                
        },
        error : function (err)
        {
            utils.GerarNotificacao(err.responseText, "danger");
        }
        
    });
});
$("#tabela-topicos").on('click', '.btn-remover-topico', function()
{
    var topico = $(this).data('topico');

    $.ajax({
        url : '/comandos/sonoff/removerTopico',
        method : 'POST',
        data : {codigo : codigo, topico : topico},
        dataType : 'JSON',
        success : function(resposta)
        {
            utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
        },
        error : function (err)
        {
            utils.GerarNotificacao(err.responseText, "danger");
        }

    });
});
function GetTopicos()
{
    $.ajax({
        url : '/comandos/sonoff/gettopicos',
        method : 'GET',
        data : {codigo : codigo},
        dataType : 'JSON',
        success : function(resposta)
        {
            var total = Object.keys(resposta.topicos).length;
            for(var i = 0; i < total; i++)  
                AdicionarTopicoTabela(resposta.topicos[i]);
        },
        error : function (err)
        {
            utils.GerarNotificacao(err.responseText, "danger");
        }
        
    });
}

function AdicionarTopicoTabela(topico)
{
    var htmlString = "<tr><td>"+topico+"</td><td><button class = 'btn btn-danger btn-remover-topico' data-topico = '"+topico+"'><i class = 'fa fa-times-circle'</i></button></td></tr>"
    $("#tabela-topicos tbody").append(htmlString);
}

function RemoverTopicoTabela(topico)
{
    var topicolower = topico.toLowerCase();
    $("#tabela-topicos .btn-remover-topico").each(function()
    {
        if($(this).data('topico') == topicolower)
            $(this).parent().parent().remove();
    });
}


observer.Observar('server-data-ready', (serverdata)=>{
    if(serverdata.modoDebug == true)
    {
        $("#row-debug").removeClass('hidden')
    }
})

observer.Observar('socket-ready', function(socket   ) {
    socket.on('att nome sonoff', function(msg){
        utils.LimparObj(msg);
        if(msg.codigo == codigo)
        {
            $("#nome-dispositivo").html(msg.nome);
        }
    });
    
    socket.on(codigo + ' add topico', function(msg){
        utils.LimparObj(msg);
        AdicionarTopicoTabela(msg.topico)
    });
    
    socket.on(codigo + ' rem topico', function(msg){
        utils.LimparObj(msg);
        RemoverTopicoTabela(msg.topico)
    });
})




