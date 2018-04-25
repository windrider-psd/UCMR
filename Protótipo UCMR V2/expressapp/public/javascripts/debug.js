$(document).ready(function()
{
    $(".btn-debug-adicionar-sonoff").on('click', function()
    {
        console.log("Adicionando sonoff");
        $.ajax({
            url : '/debug/adicionarsonoff',
            method : 'GET',
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

