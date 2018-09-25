const $ = require('jquery')
window.jQuery = $
require('bootstrap-notify')
require("bootstrap-sass");
//const notify = require('bootstrap-notify')
const bootbox = require('bootbox')


$(function()
{
    var path = window.location.pathname;
    $('nav li a[href="'+path+'"]').parents('li').addClass('active');
});
function FormatarDate(data, separador)
{
    try
    {
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
    catch(err)
    {
        data = new Date(data);
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
        
}
function LimparObj(obj)
{
    for(var chave in obj)
    {
        if(typeof(obj[chave]) == "object")
        {
            LimparObj(obj[chave])
        }
        else if(typeof(obj[chave]) == "string")
        {
            obj[chave] = obj[chave].replace(/&/g, '&amp;').
            replace(/</g, '&lt;').  
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
        }
    }
}

function FormToAssocArray(JForm)
{
    var retorno = {};
    $("input", JForm).each(function()
    {
        if($(this).attr('type').toLowerCase() == 'checkbox')
        {
            var check = false;
            if($(this).is(':checked'))
            {
                check = true;
            }

            retorno[$(this).attr('name')] = check;
        }
        else
        {
            retorno[$(this).attr('name')] = $(this).val();
        }
    });

    $("select", JForm).each(function()
    {
        retorno[$(this).attr('name')] = $('option:selected', $(this)).val();
    });
        
    return retorno;

}
function GerarNotificacao(mensagem, tipo)
{
    $(".alert").remove();
    $.notify({

    message: mensagem 
    },{
        element: 'body',
        position: null,
        type: tipo,
        allow_dismiss: true,
        newest_on_top: true,
        showProgressbar: false,
        placement: {
            from: "bottom",
            align: "center"
        },
        offset: 20,
        spacing: 10,
        z_index: 9999999,
        delay: 3000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        },
    });
}

function GerarConfirmacao(mensagem, __callback)
{
    bootbox.confirm({ 
    message: mensagem, 
    buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancelar'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirmar'
            }
        },
        callback: function(resultado){ if(resultado == true){__callback();}
      }
    });
}

module.exports = {
    FormatarDate : FormatarDate,
    FormToAssocArray : FormToAssocArray,
    GerarNotificacao : GerarNotificacao,
    GerarConfirmacao : GerarConfirmacao,
    LimparObj : LimparObj
}
