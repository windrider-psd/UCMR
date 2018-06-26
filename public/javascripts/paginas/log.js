var resultadosPorPagina = 5;
var listaCategorias = [];
var tipoAtual;
var LogData;


function TipoToString(tipo)
{

    tipo = Number(tipo);
    var tipoString;
    switch(tipo)
    {
        case 0:
            tipoString = "Geral";
            break;
        case 1:
            tipoString = "Dispositivos";
            break;
        case 2:
            tipoString = "Painel Solar";
            break;
        default:
            tipoString = "Outro";
    }
    return tipoString;
}

function GerarCategorias(data)
{
    var categorias = [0, 1, 2];
    var tabsString = '';
    for(var i = 0; i < categorias.length; i++)
    {
        listaCategorias.push({tipo : categorias[i], nome : TipoToString(categorias[i]), logs : []});
    }
    for(var i = 0; i < listaCategorias.length; i++)
    {
        tabsString += '<li><a class = "tab-btn" data-tipo = "'+listaCategorias[i].tipo+'" onclick="TrocarTab('+listaCategorias[i].tipo+')">'+listaCategorias[i].nome+'</a></li>';

        for(var j = 0; j < data.length; j++)
        {
            if(data[j].tipo == listaCategorias[i].tipo)
            {
                listaCategorias[i].logs.push(data[j]);
            }
        }
    }

    $(".nav-tabs").html(tabsString);
}

function TrocarTab(tipo)
{
    if(tipo == tipoAtual)
    {
        return;
    }
    tipoAtual = tipo;
    $(".tab-btn").parent().removeClass("active");
    $('.tab-btn[data-tipo="'+tipo+'"]').parent().addClass("active");
    var htmlString = '<div class="table-responsive"> <table class="table table-striped table-bordered"> <thead> <tr> <th>Evento</th> <th>Horário</th> </tr></thead> <tbody id="log-tbody">';
    var paginacaoString = '<ul class="pagination">';
    for(var i = 0; i < listaCategorias.length; i++)
    {
        if(listaCategorias[i].tipo == tipo)
        {
            htmlString += GerarHTMLTabela(listaCategorias[i].logs, 0);
            break;
        }
    }
    paginacaoString += GerarHTMLPaginacao(listaCategorias[i].logs, 0);
    paginacaoString += '</ul>';
    htmlString += "</tbody> </table>"+paginacaoString+"</div>";
    $(".tab-content").html(htmlString);

}

function TrocarPagina(novaPagina)
{
    $('.paginacao_pagina').parent().removeClass("active");
    $('.paginacao_pagina[data-idpagina="'+novaPagina+'"]').parent().addClass("active");
    for(var i = 0; i < listaCategorias.length; i++)
    {
        if(listaCategorias[i].tipo == tipoAtual)
        {
            $("#log-tbody").html(GerarHTMLTabela(listaCategorias[i].logs, novaPagina * resultadosPorPagina));
            break;
        }
    }
    
}


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

    return htmlStringTabela;
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
    return paginacaoString;
}


function CarregarLogData()
{
    $.ajax({
        method : 'GET',
        url : 'comandos/log/getlog',
        dataType : 'JSON',
        success : function(resposta)
        {
            console.log(resposta);
            if(resposta.mensagem.tipo != "success")
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            }
            else
            {
                GerarCategorias(resposta.log);
                TrocarTab(listaCategorias[0].tipo);
            }
            
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
    });
}
$(".tab-content").on('click', ".paginacao_pagina", function()
{
    var pagina = $(this).data('idpagina');
    TrocarPagina(pagina);
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
                    for(var i = 0; i < listaCategorias.length; i++)
                    {
                        listaCategorias[i].logs = [];
                    }
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