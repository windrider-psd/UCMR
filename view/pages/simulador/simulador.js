let $ = require('jquery')
let utils = require('../../generic/utils')

var painelId = 1;
var salaId = 1;
var idArcondicionado = 1;
var idAquecedor = 1;

var salas = new Array();
var paineis = new Array();


function AdicionarPainel(nome, potencia)
{
    paineis.push({id : painelId, nome : nome, potencia : potencia});
    painelId++;
}

function RemoverPainel(id)
{
    for(var i = 0; i < paineis.length; i++)
    {
        if(paineis[i].id == id)
        {
            paineis.splice(i, 1);
            return;
        }
    }
}

function EditarPainel(id, nome, potencia)
{
    for(var i = 0; i < paineis.length; i++)
    {
        if(paineis[i].id == id)
        {
            paineis[i].nome = nome;
            paineis[i].potencia = potencia;
            return;
        }
    }
}

function GetPainel(id)
{
    for(var i = 0; i < paineis.length; i++)
    {
        if(paineis[i].id == id)
        {
            return paineis[i];
        }
    }
}


///////////////////////////////////////////////////////////////////////////////
function AbrirModal(JModal, titulo)
{
    $(".modal-title", JModal).text(titulo);
    JModal.modal('show');
}


function getConfig()
{
    var info = FormToAssocArray($('#form-config-cenario'));
    var config = {};
    for(chave in info)
    {
        config[chave] = info[chave];
    }
    return config;
}
$('#form-config-cenario').on('submit', function()
{
    var concluir = function()
    {
        var config = getConfig();
        var data = {cenario : {paineis : paineis, salas : salas, duracao : Number(config.duracao), variancia : Number(config.variancia), duracao_variancia : Number(config.duracao_variancia)}};
        $.ajax({
            url : '/comandos/residencial/adicionar',
            method : 'POST',
            data : data,
            dataType : 'JSON',
            success : function(resposta)
            {
                utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            },
            error : function(a)
            {
                utils.GerarNotificacao(a, 'danger');
            }
        });
    };
    GerarConfirmacao('Tens certeza que desejas concluir o cenário?', concluir);
});

function AdicionarAquecedor(idsala, nome, btus, potencia)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        sala.aquecedores.push({id : idAquecedor, nome : nome, btus : btus, potencia : potencia});
        idAquecedor++;
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala.', 'danger');
    }
}

function RemoverAquecedor(idsala, idaque)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        for(var i = 0; i < sala.aquecedores.length; i++)
        {
            if(sala.aquecedores[i].id == idaque)
            {
                sala.aquecedores.splice(i , 1);
                break;
            }
        }
    }
}


function SetTabelaAquecedor(idsala)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        var ares = sala.aquecedores;
        var htmlString = "";
        for(var i = 0; i < ares.length; i++)
        {
            htmlString += "<tr data-id = '"+ares[i].id+"' data-idsala = '"+idsala+"'><td>"+ares[i].nome+"</td><td>"+ares[i].potencia+"</td><td>"+ares[i].btus+"</td><td><button type = 'button' class = 'btn btn-danger btn-excluir-aquecedor'><i class = 'fa fa-times-circle'></i></button></td></tr>";        
        }
        $("#tbody-aquecedores").html(htmlString);
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala.', 'danger');
    }
}


$("#tbody-aquecedores").on('click', '.btn-excluir-aquecedor', function()
{
    var linha = $(this).parent().parent();
    var id = linha.data('id');
    var idsala  = linha.data('idsala');
    RemoverAquecedor(idsala, id);
    linha.remove();
    utils.GerarNotificacao("Aquecedor removido com sucesso", 'success');
});

$("#form-adicionar-aquecedor-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));
    AdicionarAquecedor(info.id, info.nome, info.btus, info.potencia);
    SetTabelaAquecedor(info.id);
});

///////////////////////////////////////////////////////////////////

function AdicionarArCondicionado(idsala, nome, btus, potencia)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        sala.arcondicionados.push({id : idArcondicionado, nome : nome, btus : btus, potencia : potencia});
        idArcondicionado++;
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala.', 'danger');
    }
}

function RemoverArCondicionado(idsala, idar)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        for(var i = 0; i < sala.arcondicionados.length; i++)
        {
            if(sala.arcondicionados[i].id == idar)
            {
                sala.arcondicionados.splice(i , 1);
                break;
            }
        }
    }
}


function SetTabelaArCondicionado(idsala)
{
    var sala = GetSala(idsala);
    if(sala)
    {
        var ares = sala.arcondicionados;
        var htmlString = "";
        for(var i = 0; i < ares.length; i++)
        {
            htmlString += "<tr data-id = '"+ares[i].id+"' data-idsala = '"+idsala+"'><td>"+ares[i].nome+"</td><td>"+ares[i].potencia+"</td><td>"+ares[i].btus+"</td><td><button type = 'button' class = 'btn btn-danger btn-excluir-arcondicionado'><i class = 'fa fa-times-circle'></i></button></td></tr>";        
        }
        $("#tbody-arcondicionados").html(htmlString);
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala.', 'danger');
    }
}


$("#tbody-arcondicionados").on('click', '.btn-excluir-arcondicionado', function()
{
    var linha = $(this).parent().parent();
    var id = linha.data('id');
    var idsala  = linha.data('idsala');
    RemoverArCondicionado(idsala, id);
    linha.remove();
    utils.GerarNotificacao("Ar condicionado removido com sucesso", 'success');
});

$("#form-adicionar-arcondicionado-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));
    AdicionarArCondicionado(info.id, info.nome, info.btus, info.potencia);
    SetTabelaArCondicionado(info.id);
});

$("#form-configuracoes-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));
    var sala = GetSala(info.id);
    if(sala)
    {
        sala.configuracoes.tamanho = Number(info.tamanho);
        sala.configuracoes.lampada = info.lampada;

        utils.GerarNotificacao("Configurações salvas com sucesso", 'success');
    }
    else
    {
        utils.GerarNotificacao("Houve um erro ao salvar as configurações.", 'danger');
    }
});

function SetFormConfiguracoes(id)
{
    sala = GetSala(id);

    $("#form-configuracoes-sala-tamanho option[value='"+String(sala.configuracoes.tamanho)+"']").prop('selected', true);
    $("#form-configuracoes-sala-lampada").prop('checked', sala.configuracoes.lampada);
}

function AdicionarSala(nome, saida)
{
    salas.push({'id' : salaId, 'nome' : nome, 'saida': saida, 'conexoes' : [], 'arcondicionados' : [], 'aquecedores' : [], 'configuracoes' : {'lampada' : true, 'tamanho' : 9}});
    salaId++;
}

function GetSala(id)
{
    for(var i = 0; i < salas.length; i++)
    {
        if(salas[i].id == id)
        {
            return salas[i];
        }
    }
}

function RemoverSala(id)
{
    var removida = false;
    for(var i = 0; i < salas.length; i++)
    {
        if(salas[i].id == id)
        {
            salas.splice(i, 1);
            removida = true;
        }
    }
    if(removida)
    {
        for(var i = 0; i < salas.length; i++)
        {
            for(var j = 0; j < salas[i].conexoes.length; j++)
            {
                if(salas[i].conexoes[j] == id)
                {
                    salas[i].conexoes.splice(j, 1);
                    break;
                }
            }
        }
    }
}

function EditarSala(id, nome, saida)
{
    for(var i = 0; i < salas.length; i++)
    {
        if(salas[i].id == id)
        {
            salas[i].nome = nome;
            salas[i].saida = saida;
            return;
        }
    }
}

function AdicionarConexao(id, idconexao)
{
    id = Number(id);
    idconexao = Number(idconexao);
    var add = function(addatual, addcon)
    {
        for(var i = 0; i < salas.length; i++)
        {
            if(salas[i].id == addatual)
            {
                for(var j = 0; j < salas[i].conexoes.length;j++)
                {
                    if(salas[i].conexoes[j] == addcon)
                    {
                        return false;
                    }
                }

                salas[i].conexoes.push(addcon);
                return true;
            }
        }
    };

    if(add(id, idconexao))
    {
        add(idconexao, id);
    }

}

function RemoverConexao(idsala, idconexao)
{
    var rem = function(remsala, remconexao)
    {
        var sala = GetSala(remsala);
        for(var i = 0; i < sala.conexoes.length; i++)
        {
            if(sala.conexoes[i] == remconexao)
            {
                sala.conexoes.splice(i, 1);
                break;
            }
        }
    };

    rem(idsala, idconexao);
    rem(idconexao, idsala);
}




function SetSelectConexoes(idAtual)
{
    var htmlString = "";
    var sala = GetSala(idAtual);
    for(var i = 0; i < salas.length; i++)
    {
        if(salas[i].id != idAtual)
        {
            var esta = false;
            for(var j = 0; j < sala.conexoes.length; j++)
            {
                if(salas[i].id == sala.conexoes[j])
                {
                    esta = true;
                    break;
                }
            }
            if(!esta)
            {
                htmlString += '<option value = "'+salas[i].id+'">'+salas[i].nome+'</option>';
            }
        }
    }
    $("#form-adicionar-conexao-sala-conexao").html(htmlString);
}

function SetTabelaConexoes(id)
{
    var sala = GetSala(id);
    if(sala)
    {
        var htmlString = "";
        for(var i = 0; i < sala.conexoes.length; i++)
        {
            var salaCon = GetSala(sala.conexoes[i]);
            htmlString += '<tr data-id = "'+salaCon.id+'" data-con = "'+sala.id+'"><td>'+salaCon.nome+'</td><td><button type = "button" class = "btn btn-danger btn-excluir-conexao"><i class = "fa fa-times-circle"></i></button></td></tr>';
        }
        $("#tbody-conexoes").html(htmlString);
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala. Atualize a página.', 'danger');
    }

    
}

$("#tbody-conexoes").on('click', '.btn-excluir-conexao', function()
{
    var linha = $(this).parent().parent();
    var idrem = linha.data('id');
    var idsala = linha.data('con');
    RemoverConexao(idrem, idsala);
    linha.remove();
    SetSelectConexoes();
    utils.GerarNotificacao("Conexão removida com sucesso.","success");
});


$("#form-adicionar-painel").on('submit', function()
{
    
    var nome = $("#form-adicionar-painel-nome").val();
    var potencia = $("#form-adicionar-painel-potencia").val();
    var htmlString = "<tr data-id='"+painelId+"'><td>"+nome+"</td><td data-valor= '"+potencia+"'>"+potencia+" Watts</td><td><button class = 'btn btn-primary btn-editar-painel'><i class = 'fa fa-edit' title = 'Alterar'></i></button><button class = 'btn btn-danger btn-excluir-painel'><i class = 'fa fa-times' title = 'Excluir'></i></button></td></tr>";
    AdicionarPainel(nome, potencia);
    $("#tbody-paineis").append(htmlString);

});


$("#form-adicionar-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));   
    var htmlString = "<tr data-id = '"+salaId+"'><td>"+info.nome+"</td><td>"+(info.saida == true ? 'Sim' : 'Não') +"</td><td>Nenhuma</td><td><button class = 'btn btn-primary btn-editar-sala'><i class = 'fa fa-edit' title = 'Alterar'></i></button><button class = 'btn btn-primary btn-configurar-sala'><i class = 'fa fa-cog' title = 'Configurar'></i></button><button class = 'btn btn-danger btn-excluir-sala'><i class = 'fa fa-times' title = 'Excluir'></i></button></td></tr>";
    $("#tbody-salas").append(htmlString);
    AdicionarSala(info.nome, info.saida);
});

$("#tbody-paineis").on('click', ".btn-excluir-painel", function()
{
    var linha =$(this).parent().parent()
    var id = linha.data('id');
    RemoverPainel(id);
    linha.remove(); 
});

$("#tbody-salas").on('click', ".btn-excluir-sala", function()
{
    var linha = $(this).parent().parent();
    var id = linha.data('id');
    var sala = GetSala(id);
    var excluir = function()
    {
        RemoverSala(id);
        linha.remove();
    };

    GerarConfirmacao('Tens certeza que desejas excluir a sala <i>'+sala.nome+'</i>?', excluir);
});

$("#tbody-paineis").on('click', ".btn-editar-painel", function()
{
    var id = $(this).parent().parent().data('id');
    var painel = GetPainel(id);
    if(painel)
    {
        $("#form-editar-painel-nome").val(painel.nome);
        $("#form-editar-painel-potencia").val(painel.potencia);
        $("#form-editar-painel-id").val(id);
    
        AbrirModal($("#modal-editar-painel"), "Editar Painel solar " + painel.nome);
    }
    
});

$("#tbody-salas").on('click', ".btn-editar-sala", function()
{
    var linha = $(this).parent().parent();
    var id = linha.data('id');


    var sala = GetSala(id);
    if(sala)
    {
        $("#form-editar-sala-id").val(id);
        $("#form-editar-sala-nome").val(sala.nome);
        $("#form-editar-sala-saida").prop("checked", sala.saida);
        AbrirModal($("#modal-editar-sala"), "Editar sala " + sala.nome)
        
    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala. Atualize a página.', 'danger');
    }

    
});

$("#tbody-salas").on('click', '.btn-configurar-sala', function()
{
    var linha = $(this).parent().parent();
    var id = linha.data('id');
    var sala = GetSala(id);
    if(sala)
    {   
        SetSelectConexoes(id);
        SetTabelaConexoes(id);
        SetTabelaArCondicionado(id);
        SetTabelaAquecedor(id);
        SetFormConfiguracoes(id);
        $(".configurar-sala-id").val(id);
        AbrirModal($("#modal-configurar-sala"), "Configurar sala " + sala.nome);

    }
    else
    {
        utils.GerarNotificacao('Houve um erro ao encontrar a sala.', 'danger');
    }
});

$("#form-adicionar-conexao-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));
    if(info.conexao)
    {
        AdicionarConexao(info.id, info.conexao);
        SetSelectConexoes(info.id);
        SetTabelaConexoes(info.id);
        utils.GerarNotificacao("Conexão adicionada com sucesso", 'success');
    }
    else
    {
        utils.GerarNotificacao("Conexão não selecionada", 'warning');
    }
        
});

$("#form-editar-painel").on('submit', function()
{
    var info = FormToAssocArray($(this));
    var painel = GetPainel(info.id);
    if(painel)
    {
        EditarPainel(painel.id, info.nome, info.potencia);
        var linha = $("#tbody-paineis tr[data-id='"+info['id']+"']");
        $("td", linha).eq(0).html(info['nome']);
        $("td", linha).eq(1).data('valor', info['potencia']);
        $("td", linha).eq(1).html(info['potencia'] + " Watts");

    }
    $("#modal-editar-painel").modal('hide');
});

$("#form-editar-sala").on('submit', function()
{
    var info = FormToAssocArray($(this));
    var linha = $("#tbody-salas tr[data-id='"+info['id']+"']");
    $("td", linha).eq(0).html(info['nome']);
    $("td", linha).eq(1).html((info['saida'] == true) ? 'Sim' : 'Não');

    EditarSala(info.id, info.nome, info.saida);
    $("#modal-editar-sala").modal('hide');
});






