var resultadosPorPagina = 25;
var LogData;

function GerarHTMLTabela(data, offset)
{
    var htmlStringTabela = "";    
    var i = offset;
    var limiteReal = i + resultadosPorPagina;
    
    for(; i <= limiteReal && i < data.length; i++)
    {
        data[i].evento = data[i].evento.replace('\n', '&#92;n');
        data[i].evento = data[i].evento.replace('\r', '&#92;r');
        htmlStringTabela += "<tr data-id = '"+data[i]._id+"'><td>"+data[i].evento+"</td><td>"+FormatarDate(data[i].tempo, "/")+"</td></tr>";
    }

    
    $("#log-tbody").html(htmlStringTabela);
}

function GerarHTMLPaginacao(data, ativoIndex)
{
    var paginacaoString = "";
    var totalPaginas = Math.ceil(data.length / resultadosPorPagina);
    for(var i = 0; i < totalPaginas; i++)
    {
        paginacaoString += '<li';
        if(i == ativoIndex)
        {
            paginacaoString += ' class = "active"';
        }
        paginacaoString += '><a class="paginacao_pagina" data-idpagina="'+i+'">'+(i + 1)+'</a></li>'; 
    }

    $(".pagination").html(paginacaoString);
}


function CarregarLogData()
{
    $.ajax({
        method : 'GET',
        url : 'comandos/log/getlog',
        dataType : 'JSON',
        success : function(resposta)
        {
            if(resposta.mensagem.tipo != "success")
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            }
            else
            {
                GerarHTMLTabela(resposta.log, 0);
                GerarHTMLPaginacao(resposta.log, 0);
                LogData = resposta.log;
            }
            
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
    });
}
$(".pagination").on('click', ".paginacao_pagina", function()
{
    var pagina = $(this).data('idpagina');
    console.log(pagina);
    $(".pagination li.active").removeClass('active');
    $(".pagination").find(".paginacao_pagina[data-idpagina='"+pagina+"']").parent().addClass('active');
    GerarHTMLTabela(LogData, pagina * resultadosPorPagina)
});

$("#btn-excluir-log").on('click', function()
{
    var excluir = function()
    {
        $.ajax({
            method : 'GET',
            url : 'comandos/log/excluir',
            dataType : 'JSON',
            success : function(resposta)
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
                if(resposta.mensagem.tipo == "success")
                {
                    $("#log-tbody").html("");
                    $(".pagination").html("");
                }
            },
            error : function ()
            {
                GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
            }
        });
    }

    GerarConfirmacao("Tens certeza que desejas excluir o log?", excluir);
});

CarregarLogData();