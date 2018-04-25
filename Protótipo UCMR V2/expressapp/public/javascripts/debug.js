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
            }
        })
    }); 
});

