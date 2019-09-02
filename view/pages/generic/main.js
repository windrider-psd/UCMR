const $ = require('jquery')
const utils = require('./utils')
const observer = require('./observer')

$(document).ready(function () {
	$.ajax({
		url: 'comandos/get-server-data',
		method: 'get',
		success: function (serverdata) {
			observer.Trigger('server-data-ready', serverdata)
			
			if(serverdata.modoDebug == true)
			{
				$("#debug-main").removeClass('hidden')
			}
			$("#versao-atual").text(serverdata.versao)
			$("#ano-atual").text(serverdata.anoAtual)
		},

		error: function (err) {
			utils.GerarNotificacao("Failed to obtain the server's data: " + err.responseText, 'danger')
		}

	})

	$("#sair-href").on('click', function() {
		$.ajax({
            url : "usuarios/login",
            method : "DELETE",
            success : () => {
                window.location.replace('/')
            },
            error(err){
                console.log(err);
            }
        })
	})
})
