function GerarHTML(nodo)
{   
    var retorno = "";
    for(var i = 0; i < nodo.length; i++)
    {
        retorno += '<div class="panel panel-primary"> <div class="panel-heading"> <h3 class="panel-title">'+nodo[i].topico+'</h3> <span class="pull-right clickable panel-collapsed"><i class="glyphicon glyphicon-chevron-down" ></i></span> </div>';
        retorno += '<div class="panel-body" style = "display:none">';

        if(nodo[i].subtopicos.length > 0)
            retorno += GerarHTML(nodo[i].subtopicos);
        
        if(nodo[i].dispositivos.length > 0)
        {
            retorno += '<div class = "table-responsive"><table class = "table table-rounded"><thead><tr>'
            if(modoDebug)
                retorno += "<th>Código</th>";
            retorno += '<th>Nome</th><th>Estado</th><th>Ação</th><th>Configurações</th></tr></thead><tbody>';
            for(var j = 0; j < nodo[i].dispositivos.length; j++)
            {
                
                var tqtd = ""; //Terceira e quarta td
                if(nodo[i].dispositivos[j].estado == false)
                {
                tqtd = "<td class = 'text-warning'>Desligado <i class = 'fa fa-toggle-off'></i></td><td><button class = 'btn btn-success btn-sonoff-toggle' data-codigo = '"+nodo[i].dispositivos[j].codigo+"' data-sonoff-toggle-valor='1'> Ligar</button></td>";
                }
                else
                {
                    tqtd = "<td class = 'text-success'>Ligado <i class = 'fa fa-toggle-on'></i></td><td><button class = 'btn btn-warning btn-sonoff-toggle' data-codigo = '"+nodo[i].dispositivos[j].codigo+"' data-sonoff-toggle-valor='0'> Desligar</button></td>";
                }
                retorno += "<tr data-codigo = '"+nodo[i].dispositivos[j].codigo+"'>";
                if(modoDebug)
                    retorno += "<td>"+nodo[i].dispositivos[j].codigo+"</td>";
                retorno += "<td>"+nodo[i].dispositivos[j].nome+"</td>"+tqtd+"<td><a class = 'btn btn-primary' href = 'configuracoes?codigo="+nodo[i].dispositivos[j].codigo+"'><i class = 'fa fa-cog' title = 'Configurar'></i></a></td></tr>";
            }
            retorno += '</tbody></table></div><hr><div class = "pull-right"><button class = "btn btn-primary btn-topico-toggle" data-topico = "'+nodo[i].topico+'" data-sonoff-toggle-valor="1">Ligar todos</button> <button class = "btn btn-warning btn-topico-toggle" data-sonoff-toggle-valor="0" data-topico = "'+nodo[i].topico+'">Desligar todos</button></div>';
        }
        
        retorno +='</div></div>';
        
    }
    return retorno;
    
}

function GerarArvore(dispositivos, topicos)
{
    for(var i = 0; i < topicos.length; i++)
    {
        
        for(var j = 0; j < dispositivos.length; j++)
        {
            var esta = false;
            for(var x = 0; x < dispositivos[j].topicos.length; x++)
            {
                if(dispositivos[j].topicos[x] == topicos[i].topico)
                {
                    topicos[i].dispositivos.push(dispositivos[j]);
                    break;
                }
            }
        }
    }
    for(var i = 0; i < topicos.length; i++)
    {
        var subs = topicos[i].topico.split("/");
        var subsObj = new Array();
        var subsubs;
        var possiveisPais = new Array();
        for(var j = 0 ; j < subs.length - 1; j++)
        {
            subsObj.push({topico : subs[j], index : j});
        }

        for(var j = 0; j < topicos.length; j++)
        {
            subsubs = topicos[j].topico.split("/");
            
            for(var y = 0; y < subsObj.length; y++)
            {   
                for(var z = 0; z < subsubs.length; z++)
                {
                    if(subsObj[y].topico == subsubs[z] && subsObj[y].index == z && subsObj.length + 1 > subsubs.length)
                    {
                        possiveisPais.push(topicos[j]);
                    }
                }
            }     
        }
        var pai = null;
        var maiorScore = null;
        for(var z = 0; z < possiveisPais.length; z++)
        {
            var score = 0;
            var splitpospai = possiveisPais[z].topico.split('/');
            for(var j = 0, x = 0; j < subs.length; j++, x++)
            {
                
                if(typeof(splitpospai[x]) != 'undefined')
                {
                    if(splitpospai[x] == subs[j])
                    {
                        score++;
                    }
                    else
                    {
                        score--;
                    }
                }
            }
            if(maiorScore == null || score > maiorScore)
            {
                pai = possiveisPais[z];
                maiorScore = score;
            }
        }

        if(pai != null)
        {
            pai.subtopicos.push(topicos[i]);
            topicos[i].filho = true;
        }
        
        
    }

    var arvore = new Array();
    for(var i = 0; i < topicos.length; i++)
    {
        if(topicos[i].filho == false)
        {
            arvore.push(topicos[i]);
        }
    }
    return arvore;
}

function GerarConteudo(dispositivos)
{
    if(dispositivos.length == 0)
        $("#topicos-conteudo").html("<h3 class = 'text-danger text-center'><b>Nenhum dispositivo conectado</b></h3>");
    else
    {
        var topicos = new Array();
        for(var i = 0; i < dispositivos.length; i++)
        {
            for(var j = 0; j < dispositivos[i].topicos.length; j++)
            {
                var topico = dispositivos[i].topicos[j];
                var esta = false;
                for(var x = 0; x < topicos.length; x++)
                {
                    if(topicos[x].topico == topico)
                    {
                        esta = true;
                        break;
                    }
                }
                if(!esta)
                    topicos.push({topico : topico, subtopicos : [], filho : false, dispositivos: new Array()});
            }
        }

        if(topicos.length == 0)
            $("#topicos-conteudo").html("<h3 class = 'text-danger text-center'><b>Dispositivos inscritos em nenhum tópico</b></h3><p class = 'text-center'>Para inscrever um dispositivo em tópicos, entre nas <i>configurações</i> do dispositivo desejado na <a class = 'link' href = '/'><i>página inicial</i></a></p>");
        else
        {

            var arvore = GerarArvore(dispositivos, topicos);
            var htmlString = '<div class = "container">';
            htmlString += GerarHTML(arvore);
            htmlString += '</div>';
            $("#topicos-conteudo").html(htmlString);
        }
    }
}
function AtualizarLinha(codigo, valor)
{
        var linha = $("#topicos-conteudo tbody tr[data-codigo='"+codigo+"']");
        linha.each(function()
        {
            var tdimg;
            var tdbtn;
            if(modoDebug)
            {
                tdimg = $(this).children().eq(2);
                tdbtn = $("button", $(this).children().eq(3));
            }
                
            else
            {
                tdimg = $(this).children().eq(1);
                tdbtn = $("button", $(this).children().eq(2));
            }
                
            if(valor == 1)
            {
                tdbtn.removeClass('btn-success');
                tdbtn.data('sonoff-toggle-valor', '0');
                tdbtn.addClass('btn-warning');
                tdbtn.html("Desligar");

                tdimg.removeClass('text-warning');
                tdimg.addClass('text-success');
                tdimg.html('Ligado <i class = "fa fa-toggle-on"></i>');
                
            }
            else
            {
                tdbtn.removeClass('btn-warning');
                tdbtn.data('sonoff-toggle-valor', '1');
                tdbtn.addClass('btn-success');
                tdbtn.html("Ligar");

                tdimg.removeClass('text-sucess');
                tdimg.addClass('text-warning');
                tdimg.html('Desligado <i class = "fa fa-toggle-off"></i>');
            }
        });
}
$("#topicos-conteudo").on('click', '.panel-heading span.clickable', function(e){
    var $this = $(this);
    if(!$this.hasClass('panel-collapsed')) {
        $this.parent().next().slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        
    } else {
        $this.parent().next().slideDown();
        $this.removeClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    }
});

var podeAtualizar = true;
$("#topicos-conteudo").on('click', '.btn-sonoff-toggle', function()
{
    if(!podeAtualizar)
        return;
    podeAtualizar = false;
    var codigo = $(this).data('codigo');
    var valor = $(this).data('sonoff-toggle-valor');
    var btn = $(this);
    $.ajax({
        url : '/comandos/sonoff/togglepower',
        method : 'POST',
        data : {tipo : 'codigo', filtro : codigo, valor : valor},
        dataType : 'JSON',
        success : function(resposta)
        {
            GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            AtualizarLinha(codigo, valor);

            var codigos = new Array();
            codigos.push(codigo);
            var mensagem = {codigos : codigos, valor : valor};
            socket.emit('att estado sonoff', mensagem);
            podeAtualizar = true;
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
        
    });
});

$("#topicos-conteudo").on('click', '.btn-topico-toggle', function()
{
    if(!podeAtualizar)
        return;
    podeAtualizar = false;
    var topico = $(this).data('topico');
    var valor = $(this).data('sonoff-toggle-valor');
    var btn = $(this);
    $.ajax({
        url : '/comandos/sonoff/togglepower',
        method : 'POST',
        data : {tipo : 'topico', filtro : topico, valor : valor},
        dataType : 'JSON',
        success : function(resposta)
        {
            
            GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            var table = $("> .table-responsive table tbody", btn.parent().parent());
            var codigos = new Array();
            table.children("tr").each(function()
            {
                var codigoTr = $(this).data('codigo');
                codigos.push(codigoTr);
                AtualizarLinha(codigoTr, valor);
                
            });
            var mensagem = {codigos : codigos, valor : valor};
            socket.emit('att estado sonoff', mensagem);
            podeAtualizar = true;
        },
        error : function ()
        {
            GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
        }
        
    });
});

socket.on('att estado sonoff', function(msg){
    LimparObj(msg);
    for(var i = 0; i < obj.codigos.length; i++)
    {
        AtualizarLinha(msg.codigos[i], msg.valor);
        
    }        
});
socket.on('att nome sonoff', function(msg){
    LimparObj(msg);
    var linha = $("#topicos-conteudo tbody tr[data-codigo='"+msg.codigo+"']");
    linha.each(function()
    {
        var tdnome;
        if(modoDebug)
            tdnome = $(this).children().eq(1);
        else
            tdnome = $(this).first();
        tdnome.html(msg.nome);
    });
   
});

socket.on('topicos updated', function(msg){
    LimparObj(msg);
   GerarConteudo(msg);
});
GerarConteudo(dispinit);