const $ = require('jquery')
const utils = require('./utils')
const observer = require('./observer')

$(document).ready(function () {
	/*$.ajax({
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

	})*/

	$("#logout-link").on('click', function() {
		$.ajax({
            url : "users/login",
            method : "DELETE",
            success : () => {
                window.location.replace('/')
            },
            error(err){
                console.log(err);
            }
        })
	})

	$.ajax({
		url: '/users/session',
		method: 'GET',
		dataType: "JSON",
		success: function (data) {
			observer.Trigger('user-data-ready', data)
			
			if(data.admin == true)
			{
				$(".admin-only").removeClass('admin-only')
			}
		},

		error: function (err) {
			
		}
	})
	
})
