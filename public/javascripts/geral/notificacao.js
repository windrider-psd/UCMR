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

