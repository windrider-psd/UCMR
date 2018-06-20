var chart;
var logSolar;
var color = Chart.helpers.color;
var timeFormat = 'DD-MM-YYYY hh:mm:ss';
function tipoToString(tipo)
{
    tipo = Number(tipo);
    var tipoString;
    switch(tipo)
    {
        case 0:
            tipoString = "Debug";
            break;
        case 1:
            tipoString = "Fronius";
            break;
        default:
            tipoString = "Desconhecido";
    }
    return tipoString;
}
function estadoToString(estado)
{
    var string;
    if(estado)
    {
        string = "<b><span class = 'text-success'>Sucesso</span></b>";
    }
    else
    {
        string = "<b><span class = 'text-danger'>Falha</span></b>";
    }
    return string;
}

function AtualizarTabelaPainel(data)
{
    var linha = $("#tbody-paineis tr[data-id='"+data._id+"']");
    $(".lista-nome", linha).html(data.nome)
    $(".lista-caminho", linha).html(data.path)
    $(".lista-host", linha).html(data.host)

    $(".lista-tipo", linha).html(tipoToString(data.tipo))
    $(".lista-tipo", linha).data('tipo', data.tipo);
    $(".lista-tipo", linha).attr('data-tipo', data.tipo);
}

function AtualizarTabelaPainelEstado(id, estado)
{
    var linha = $("#tbody-paineis tr[data-id='"+id+"']");
    $(".lista-estado", linha).html(estadoToString(estado));
}

function AdicionarTabelaPainel(data)
{
    var tipoString = tipoToString(data.tipo);
    var estadoString = estadoToString(data.estado);
    var htmlString = '<tr data-id="'+data._id+'" class = "lista-id"><td class = "lista-nome">'+data.nome+'</td><td class = "lista-tipo" data-tipo="'+data.tipo+'">'+tipoString+'</td><td  class = "lista-estado">'+estadoString+'</td><td class = "lista-host">'+data.host+'</td><td class = "lista-caminho">'+data.path+'</td><td><button type = "button" class = "btn btn-primary btn-editar-painel" title = "Editar"><i class = "fa fa-edit"></i></button><button type = "button" class = "btn btn-danger btn-excluir-painel" title = "Excluir"><i class = "fa fa-times-circle"></i></button></td></tr>';
    $("#tbody-paineis").append(htmlString);
}
function RemoverTabelaPainel(id)
{
    $("#tbody-paineis tr[data-id='"+id+"']").remove();
}

function RemoverPainelGrafico(id)
{
    var i;
    var encontrado = false;
    for(i = 0; i < chart.data.datasets.length; i++)
    {
        if(chart.data.datasets[i]._id == id)
        {
            encontrado = true;
            break;
        }
        
    }
    if(encontrado)
    {
        chart.data.datasets.splice(i, 1);
    }
    
    chart.update();    
}

function AdicionarPainelGrafico(painel)
{
    var cor = getRandomColor();
    chart.data.datasets.push({
        _id : painel._id,
        label: painel.nome,
        backgroundColor: cor,
        borderColor: cor,
        lineTension: 0,
        fill: false,
                            
        data: []
    });
    chart.update();
}

function AtualizarNomePainelGrafico(painel)
{
    for(var i = 0; i < chart.data.datasets.length; i++)
    {
        if(chart.data.datasets[i]._id == painel._id)
        {
            chart.data.datasets[i].label = painel.nome;
            chart.update(); 
            return;
        }
        
    }
    
        
}

$("#form-adicionar-painel").on('submit', function()
{
    var data = $(this).serialize();
    
    $.ajax({
        url : '/comandos/painel/adicionar',
        method : 'POST',
        data : data,
        dataType : 'JSON',
        success : function(resposta)
        {
            GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);       
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
        
    });
});
$("#form-editar-painel").on('submit', function()
{
    var dataArray = $(this).serializeArray();
    var data =  $.param(dataArray);
    var dataAssocArray  = {};
    for(var i = 0; i < dataArray.length; i++)
    {
        dataAssocArray[dataArray[i].name] = dataArray[i].value;
    }
    dataAssocArray['_id'] = dataAssocArray.id;
    $.ajax({
        url : '/comandos/painel/editar',
        method : 'POST',
        data : data,
        dataType : 'JSON',
        success : function(resposta)
        {
            GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
        
    });
});
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function GetLogSolar()
{
    $.ajax({
        url : '/comandos/painel/getlogsolar',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            logSolar = resposta.logSolar;
            for(var i = 0; i < logSolar.length; i++)
            {
                AdicionarTabelaPainel(logSolar[i]);
            }
            var dataSets = new Array();
            for(var i = 0; i < logSolar.length; i++)
            {

                var thisdataset = new Array();
                for(var j = 0; j < logSolar[i].logs.length; j++)
                {
                    var tempo = new Date(logSolar[i].logs[j].tempo);
                    thisdataset.push({x : FormatarDate(tempo, "-"), y : logSolar[i].logs[j].valor});
                }
                var localTotalAgora = logSolar[i].logs[j - 1];
                var somaAgora = (typeof(localTotalAgora) != 'undefined') ? parseInt(localTotalAgora.valor) : 0;
                var cor = getRandomColor();
                dataSets.push({
                        _id : logSolar[i]._id,
                        label: logSolar[i].nome,
                        backgroundColor: cor,
                        borderColor: cor,
                        lineTension: 0,
                        fill: false,
                                            
                        data: thisdataset
                    });
            }

            var config = {
                type: 'line',
                data: {             
                    datasets: dataSets
                },
                options: {
                    title: {
                        text: 'Chart.js Time Scale'
                    },
                                    
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                parser: timeFormat,
                                tooltipFormat: 'll HH:mm'
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Horário'
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Produção em W'
                            }
                        }]
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },

                    zoom: {
                        enabled: true,
                        drag: false,
                        mode: 'xy',
                    }
                }
            };

            var ctx = document.getElementById('canvas').getContext('2d');
            chart = new Chart(ctx, config);
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação.", "danger");
        }   
    });
}





$("#tbody-paineis").on('click', ".btn-excluir-painel",  function()
{
    var linha = $(this).parent().parent();
    
    var enviarExcluir = function()
    {
        var codigo = linha.data('id');
        $.ajax({
            url : '/comandos/painel/excluir',
            method : 'POST',
            data : {id : codigo},
            dataType : 'JSON',
            success : function(resposta)
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            },
            error : function ()
            {
                GerarNotificacao("Houve um erro na aplicação.", "danger");
            }   
        });
    };
    
    GerarConfirmacao("Tens certeza que queres excluir painel <i>"+linha.find("td").first().html()+"</i> ?", enviarExcluir);
    
});
$("#tbody-paineis").on('click', ".btn-editar-painel",  function()
{
    var linha = $(this).parent().parent();
    var nome = $(".lista-nome", linha);
    var caminho = $(".lista-caminho", linha);
    var tipo = $(".lista-host", linha);

    $("#editar-id").val(linha.data("id"));
    $("#editar-nome").val(nome.text());
    $("#editar-caminho").val(caminho.text());
    $("#editar-host").val(tipo.text());
    $("#editar-tipo").val($(".lista-tipo", linha).data("tipo"));
    
    $("#modal-editar-painel").modal('show');
});

$("#btn-reset-zoom-grafico").on('click', function()
{
    chart.resetZoom();
});
$("#btn-excluir-dados-grafico").on('click', function()
{
    var excluir = function() 
    {
        $.ajax({
        url : '/comandos/painel/excluirlog',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);

            chart.data.datasets.forEach((dataset) =>
            {
                dataset.data = [];
            });
            chart.update();
            
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação.", "danger");
        }   
        })
    }

    GerarConfirmacao("Tens certeza que desejas excluir todos os dados de produção de energia coletados?", excluir);
});



GetLogSolar();


socket.on('att painel', function(mensagem)
{
    LimparObj(mensagem);
    AtualizarTabelaPainel(mensagem);
    AtualizarNomePainelGrafico(mensagem);
});
socket.on('add painel', function(mensagem)
{
    LimparObj(mensagem);
    AdicionarTabelaPainel(mensagem);
    AdicionarPainelGrafico(mensagem);
});
socket.on('rem painel', function(mensagem)
{
    LimparObj(mensagem);
    RemoverTabelaPainel(mensagem);
    RemoverPainelGrafico(mensagem);
});
socket.on('att grafico energia', function (mensagem)
{
    LimparObj(mensagem);
    tempo = new Date(mensagem.tempo);
    chart.data.datasets.forEach((dataset) =>
    {
        if(dataset._id == mensagem.id)
        {
            var data  = {x : FormatarDate(tempo, "-"), y : mensagem.valor };
            dataset.data.push(data);
        }
        
    });
    chart.update();
});
socket.on('att painel estado', function(mensagem)
{
    LimparObj(mensagem);
    AtualizarTabelaPainelEstado(mensagem.id, mensagem.estado)
});
       