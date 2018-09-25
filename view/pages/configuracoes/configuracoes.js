let $ = require('jquery')
let utils = require('../../generic/utils')
let observer = require('./../../generic/observer')
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
            utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
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
        error : function ()
        {
            utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
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
        error : function ()
        {
            utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
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
        error : function ()
        {
            utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
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

observer.Observar('socket-ready', function() {
    socket.on('att nome sonoff', function(msg){
        LimparObj(msg);
        if(msg.codigo == codigo)
        {
            $("#nome-dispositivo").html(msg.nome);
        }
    });
    
    socket.on(codigo + ' add topico', function(msg){
        LimparObj(msg);
        AdicionarTopicoTabela(msg.topico)
    });
    
    socket.on(codigo + ' rem topico', function(msg){
        LimparObj(msg);
        RemoverTopicoTabela(msg.topico)
    });
})




GetTopicos();