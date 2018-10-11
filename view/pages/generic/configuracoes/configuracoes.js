let $ = require('jquery')
let utils = require('../../generic/utils')
let observer = require('./../../generic/observer')

let gets = utils.ParseGET()
let codigo;
let dispositivo;


function GetTopicos()
{
    for (let i = 0; i < dispositivo.topicos.length; i++)
    {
        AdicionarTopicoTabela(dispositivo.topicos[i]);
    }

}

function AdicionarTopicoTabela(topico)
{
    let htmlString = `<tr><td>${topico}</td><td><button class = 'btn btn-danger btn-remover-topico' data-topico = "${topico}"><i class = 'fa fa-times-circle'</i></button></td></tr>`
    $("#tabela-topicos tbody").append(htmlString);
}

function RemoverTopicoTabela(topico)
{
    let topicolower = topico.toLowerCase();
    $("#tabela-topicos .btn-remover-topico").each(function ()
    {
        if ($(this).data('topico') == topicolower)
            $(this).parent().parent().remove();
    });
}

function GetSensores()
{
    let htmlString = ''
    for (let i = 0; i < dispositivo.sensores.length; i++)
    {
        let nomeSensor = $(`#form-adicionar-sensor select > option[value="${dispositivo.sensores[i].tipo}"]`).text()
        htmlString += `
        <tr data-tipo = "${dispositivo.sensores[i].tipo}" data-gpio = "${dispositivo.sensores[i].gpio}">
            <td>${nomeSensor}</td>
            <td>${dispositivo.sensores[i].gpio}</td>
            <td>
                <button class = "btn btn-primary btn-editar-sensor"><i class = "fa fa-edit"></i></button>
                <button class = "btn btn-danger btn-remover-sensor"><i class = "fa fa-times"></i></button>
            </td>
        </tr>`
    }
    $("#tabela-sensores tbody").html(htmlString)
}

$(document).ready(function ()
{

    $("#tabela-sensores tbody").on('click', '.btn-remover-sensor', function(){
        let linha = $(this).parent().parent();
        let params = {
            tipo : linha.data('tipo'),
            gpio : linha.data('gpio'),
            codigo : dispositivo.idDispositivo
        }

        $.ajax({
            url : 'comandos/sensor',
            method : "DELETE",
            data : params,
            success : function(){
                utils.GerarNotificacao("Sensor removido com sucesso", "success")
            },
            error : function(err){
                utils.GerarNotificacao(err.responseText, "danger")
            },

        })
    })

    if (typeof (gets.codigo) != 'undefined' || isNaN(gets.codigo))
    {
        $.ajax(
        {
            url: '/comandos/sonoff/get-dispositivo',
            method: 'GET',
            data:
            {
                codigo: gets.codigo
            },
            dataType: 'JSON',
            success: function (resposta)
            {
                $("#row-debug p").text(resposta.idDispositivo);
                $("#nome-dispositivo").text(resposta.nome)
                $("input[name='codigo']").val(resposta.idDispositivo)
                codigo = resposta.idDispositivo
                dispositivo = resposta;
                GetTopicos()
                GetSensores()
            },
            error: function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger");
            }
        })
    }
    else
    {
        utils.GerarNotificacao("Device not found")
    }

    $("#form-alterar-nome").on('submit', function ()
    {
        let info = $(this).serialize();
        let nome = $('input[name="nome"]', $(this)).val();

        $.ajax(
        {
            url: '/comandos/sonoff/alterarNome',
            method: 'POST',
            data: info,
            dataType: 'JSON',
            success: function (resposta)
            {
                utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            },
            error: function (a)
            {
                utils.GerarNotificacao(a.responseText, "danger");
            }

        });
    });
    $("#form-adicionar-topico").on('submit', function ()
    {
        let info = $(this).serialize();
        $.ajax(
        {
            url: '/comandos/sonoff/inscreverTopico',
            method: 'POST',
            data: info,
            dataType: 'JSON',
            success: function (resposta)
            {
                utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);

            },
            error: function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger");
            }

        });
    });

    $("#form-adicionar-sensor").on('submit', function ()
    {
        let info = utils.FormToAssocArray($(this))
        info.codigo = dispositivo.idDispositivo
        $.ajax(
        {
            url: '/comandos/sensor',
            method: 'POST',
            data: info,
            success: function ()
            {
                utils.GerarNotificacao("Sensor adicionado com sucesso", "success")
            },
            error: function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger");
            }

        });
    });

    $("#tabela-topicos").on('click', '.btn-remover-topico', function ()
    {
        let topico = $(this).data('topico');

        $.ajax(
        {
            url: '/comandos/sonoff/removerTopico',
            method: 'POST',
            data:
            {
                codigo: codigo,
                topico: topico
            },
            dataType: 'JSON',
            success: function (resposta)
            {
                utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
            },
            error: function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger");
            }

        });
    });
})


observer.Observar('server-data-ready', (serverdata) =>
{
    if (serverdata.modoDebug == true)
    {
        $("#row-debug").removeClass('hidden')
    }
})

observer.Observar('socket-ready', function (socket)
{
    socket.on('att nome sonoff', function (msg)
    {
        utils.LimparObj(msg);
        if (msg.codigo == codigo)
        {
            $("#nome-dispositivo").html(msg.nome);
        }
    });

    socket.on(codigo + ' add topico', function (msg)
    {
        utils.LimparObj(msg);
        AdicionarTopicoTabela(msg.topico)
    });

    socket.on(codigo + ' rem topico', function (msg)
    {
        utils.LimparObj(msg);
        RemoverTopicoTabela(msg.topico)
    });
})