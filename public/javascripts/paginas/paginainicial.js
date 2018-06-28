function AtualizarDispositivos()
{
    $.ajax({
        url : '/comandos/sonoff/getsonoffs',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            console.log(resposta);
            var htmlStringConectado = "";
            var htmlStringDesconectado = "";
            var total = Object.keys(resposta).length;
            for(var i = 0; i < total; i++)
            {
                if(resposta[i].conectado == true)
                {
                    var tqtd = ""; //Terceira e quarta td
                
                    if(resposta[i].estado == false)
                    {
                        tqtd = "<td class = 'text-warning sonoff-td-toggle-i'>Desligado <i class = 'fa fa-toggle-off'></i></td><td class = 'sonoff-td-toggle-btn'><button class = 'btn btn-success btn-sonoff-toggle' data-codigo = '"+resposta[i].codigo+"' data-sonoff-toggle-valor='1'> Ligar</button></td>";
                    }
                    else
                    {
                        tqtd = "<td class = 'text-success sonoff-td-toggle-i'>Ligado <i class = 'fa fa-toggle-on'></i></td><td class = 'sonoff-td-toggle-btn'><button class = 'btn btn-warning btn-sonoff-toggle' data-codigo = '"+resposta[i].codigo+"' data-sonoff-toggle-valor='0'> Desligar</button></td>";
                    }
                    htmlStringConectado+= "<tr data-codigo = '"+resposta[i].codigo+"' data-nome = '"+resposta[i].nome+"'>";
                    if(modoDebug == true)
                        htmlStringConectado+= "<td>"+resposta[i].codigo+"</td>"
                    htmlStringConectado += "<td>"+resposta[i].nome+"</td>"+tqtd+"<td><a class = 'btn btn-primary btn-conf-sonoff' href = 'configuracoes?codigo="+resposta[i].codigo+"'><i class = 'fa fa-cog' title = 'Configurar'></i></a></td></tr>";
                }
                else
                {
                    htmlStringDesconectado+= "<tr data-codigo = '"+resposta[i].codigo+"' data-nome = '"+resposta[i].nome+"'>";
                    if(modoDebug == true)
                        htmlStringDesconectado+= "<td>"+resposta[i].codigo+"</td>"
                    htmlStringDesconectado += "<td>"+resposta[i].nome+"</td><td><a class = 'btn btn-danger btn-excluir-sonoff' data-codigo = '"+resposta[i].codigo+"'><i class = 'fa fa-times-circle' title = 'Excluir'></i></a></td><td><a class = 'btn btn-primary btn-conf-sonoff' href = 'configuracoes?codigo="+resposta[i].codigo+"'><i class = 'fa fa-cog' title = 'Configurar'></i></a></td></tr>";
                }
                
            }
                $("#tabela-dispositivos tbody").html(htmlStringConectado);
                $("#tabela-dispositivos").show();
                $("#tabela-dispositivos-desco tbody").html(htmlStringDesconectado);
                $("#tabela-dispositivos-desco").show();
                $("#aviso-dispositivos").hide();  
        },
        error : function()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
    });
}

function AtualizarLinhaEstadoSonoff(codigo, estado)
{
    var linha = $("#tabela-dispositivos tr[data-codigo='"+codigo+"']");
    if(estado == false)
    {
        $(".sonoff-td-toggle-i", linha).html("Desligado <i class = 'fa fa-toggle-off'></i>");
        $(".sonoff-td-toggle-btn", linha).html("<button class = 'btn btn-success btn-sonoff-toggle' data-codigo = '"+codigo+"' data-sonoff-toggle-valor='1'> Ligar</button>");
    }
    else
    {
        $(".sonoff-td-toggle-i", linha).html("Ligado <i class = 'fa fa-toggle-on'></i>");
        $(".sonoff-td-toggle-btn", linha).html("<button class = 'btn btn-warning btn-sonoff-toggle' data-codigo = '"+codigo+"' data-sonoff-toggle-valor='0'> Desligar</button>");
    }
}

$("#tabela-dispositivos").on('click', '.btn-sonoff-toggle', function()
{
    var codigo = $(this).data('codigo');
    var valor = $(this).data('sonoff-toggle-valor');
    
    $.ajax({
        url : '/comandos/sonoff/togglepower',
        method : 'POST',
        data : {tipo : 'codigo', filtro : codigo, valor : valor},
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

$("#tabela-dispositivos-desco").on('click', '.btn-excluir-sonoff', function()
{
    var codigo = $(this).data('codigo');
    var nome = $(this).parent().parent().data('nome');
    var excluir = function () {
        $.ajax({
            url : '/comandos/sonoff/excluir',
            method : 'POST',
            data : {codigo : codigo},
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
    };

    GerarConfirmacao("Tens certeza que desejas excluir os dados de <i><b>" + nome + "</b></i>?", excluir);
});



socket.on('att estado sonoff', function(msg){
    LimparObj(msg);
    for(var i = 0; i < msg.codigos.length; i++)
    {
        AtualizarLinhaEstadoSonoff(msg.codigos[i], msg.valor);
    }        
});

socket.on('att nome sonoff', function(msg){
    LimparObj(msg);
    var linha = $(".tabela tr[data-codigo='"+msg.codigo+"']");
    var tdnome;
    if(modoDebug)
        tdnome = linha.children().eq(1);
    else
        tdnome = linha.first();
    tdnome.html(msg.nome);
    linha.data("nome", msg.nome);
    linha.attr('data-nome', msg.nome);
});
socket.on('update sonoff', function(msg){
    LimparObj(msg);
    AtualizarDispositivos();
});

AtualizarDispositivos();
