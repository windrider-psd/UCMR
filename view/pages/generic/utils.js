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

function parse_query_string(query) {
    if(typeof(query) == 'undefined')
        var query = window.location.search.substring(1)
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      // If first entry with this name
      if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
        // If second entry with this name
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
        // If third or later entry with this name
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
}

module.exports = {
    FormatarDate : FormatarDate,
    FormToAssocArray : FormToAssocArray,
    GerarNotificacao : GerarNotificacao,
    GerarConfirmacao : GerarConfirmacao,
    LimparObj : LimparObj,
    ParseGET : parse_query_string
}
