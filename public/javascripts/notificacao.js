function GerarNotificacao(mensagem, tipo)
{
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

