$(document).ready(function()
{
    $(".btn-debug-adicionar-sonoff").on('click', function()
    {
        $.ajax({
            url : '/debug/adicionarsonoff',
            method : 'GET',
            dataType : 'JSON',
            success : function(resposta)
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
                socket.emit('update sonoff', "");
                if(typeof(AtualizarDispositivos) !== 'undefined')
                {
                    AtualizarDispositivos();
                }    
            },
            error : function(a)
            {
                $("html").html(a.responseText);
            }
        })
    }); 
    $("#debug-form-enviar-mensagem").on('submit', function()
    {
        
        var info = $(this).serialize();
        $.ajax({
            url : '/debug/enviarMensagem',
            method : 'POST',
            data :info,
            dataType : 'JSON',
            success : function(resposta)
            {
                GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
                if(typeof(AtualizarDispositivos) !== 'undefinided')
                {
                    AtualizarDispositivos();
                }    
            },
            error : function(a)
            {
                $("html").html(a.responseText);
            }
        })
    }); 
});

