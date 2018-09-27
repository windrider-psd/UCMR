let $ = require('jquery');
let utils = require('../../generic/utils');
let observer = require('../../generic/observer');
observer.Observar('server-data-ready', (serverdata) =>
{
	function GerarHTML(nodo)
	{
		let retorno = "";
		for (let i = 0; i < nodo.length; i++)
		{
			retorno += '<div class="panel panel-primary"> <div class="panel-heading"> <h3 class="panel-title">' + nodo[i].topico + '</h3> <span class="pull-right clickable panel-collapsed"><i class="glyphicon glyphicon-chevron-down" ></i></span> </div>';
			retorno += '<div class="panel-body" style = "display:none">';

			if (nodo[i].subtopicos.length > 0)
				retorno += GerarHTML(nodo[i].subtopicos);

			if (nodo[i].dispositivos.length > 0)
			{
				retorno += '<div class = "table-responsive"><table class = "table table-rounded"><thead><tr>'
				if (serverdata.modoDebug)
					retorno += "<th>Código</th>";
				retorno += '<th>Nome</th><th>Estado</th><th>Ação</th><th>Configurações</th></tr></thead><tbody>';
				for (let j = 0; j < nodo[i].dispositivos.length; j++)
				{

					let tqtd = ""; //Terceira e quarta td
					if (nodo[i].dispositivos[j].estado == false)
					{
						tqtd = "<td class = 'text-warning'>Desligado <i class = 'fa fa-toggle-off'></i></td><td><button class = 'btn btn-success btn-sonoff-toggle' data-codigo = '" + nodo[i].dispositivos[j].codigo + "' data-sonoff-toggle-valor='1'> Ligar</button></td>";
					}
					else
					{
						tqtd = "<td class = 'text-success'>Ligado <i class = 'fa fa-toggle-on'></i></td><td><button class = 'btn btn-warning btn-sonoff-toggle' data-codigo = '" + nodo[i].dispositivos[j].codigo + "' data-sonoff-toggle-valor='0'> Desligar</button></td>";
					}
					retorno += "<tr data-codigo = '" + nodo[i].dispositivos[j].codigo + "'>";
					if (serverdata.modoDebug)
						retorno += "<td>" + nodo[i].dispositivos[j].codigo + "</td>";
					retorno += "<td>" + nodo[i].dispositivos[j].nome + "</td>" + tqtd + "<td><a class = 'btn btn-primary' href = 'configuracoes?codigo=" + nodo[i].dispositivos[j].codigo + "'><i class = 'fa fa-cog' title = 'Configurar'></i></a></td></tr>";
				}
				retorno += '</tbody></table></div><hr><div class = "pull-right"><button class = "btn btn-primary btn-topico-toggle" data-topico = "' + nodo[i].topico + '" data-sonoff-toggle-valor="1">Ligar todos</button> <button class = "btn btn-warning btn-topico-toggle" data-sonoff-toggle-valor="0" data-topico = "' + nodo[i].topico + '">Desligar todos</button></div>';
			}

			retorno += '</div></div>';

		}
		return retorno;

	}

	function GerarArvore(dispositivos, topicos)
	{
		for (let i = 0; i < topicos.length; i++)
		{

			for (let j = 0; j < dispositivos.length; j++)
			{
				let esta = false;
				for (let x = 0; x < dispositivos[j].topicos.length; x++)
				{
					if (dispositivos[j].topicos[x] == topicos[i].topico)
					{
						topicos[i].dispositivos.push(dispositivos[j]);
						break;
					}
				}
			}
		}
		for (let i = 0; i < topicos.length; i++)
		{
			let subs = topicos[i].topico.split("/");
			let subsObj = new Array();
			let subsubs;
			let possiveisPais = new Array();
			for (let j = 0; j < subs.length - 1; j++)
			{
				subsObj.push(
				{
					topico: subs[j],
					index: j
				});
			}

			for (let j = 0; j < topicos.length; j++)
			{
				subsubs = topicos[j].topico.split("/");

				for (let y = 0; y < subsObj.length; y++)
				{
					for (let z = 0; z < subsubs.length; z++)
					{
						if (subsObj[y].topico == subsubs[z] && subsObj[y].index == z && subsObj.length + 1 > subsubs.length)
						{
							possiveisPais.push(topicos[j]);
						}
					}
				}
			}
			let pai = null;
			let maiorScore = null;
			for (let z = 0; z < possiveisPais.length; z++)
			{
				let score = 0;
				let splitpospai = possiveisPais[z].topico.split('/');
				for (let j = 0, x = 0; j < subs.length; j++, x++)
				{

					if (typeof (splitpospai[x]) != 'undefined')
					{
						if (splitpospai[x] == subs[j])
						{
							score++;
						}
						else
						{
							score--;
						}
					}
				}
				if (maiorScore == null || score > maiorScore)
				{
					pai = possiveisPais[z];
					maiorScore = score;
				}
			}

			if (pai != null)
			{
				pai.subtopicos.push(topicos[i]);
				topicos[i].filho = true;
			}


		}

		let arvore = new Array();
		for (let i = 0; i < topicos.length; i++)
		{
			if (topicos[i].filho == false)
			{
				arvore.push(topicos[i]);
			}
		}
		return arvore;
	}

	function GerarConteudo(dispositivos)
	{
		if (dispositivos.length == 0)
			$("#topicos-conteudo").html("<h3 class = 'text-danger text-center'><b>Nenhum dispositivo conectado</b></h3>");
		else
		{
			let topicos = new Array();
			for (let i = 0; i < dispositivos.length; i++)
			{
				for (let j = 0; j < dispositivos[i].topicos.length; j++)
				{
					let topico = dispositivos[i].topicos[j];
					let esta = false;
					for (let x = 0; x < topicos.length; x++)
					{
						if (topicos[x].topico == topico)
						{
							esta = true;
							break;
						}
					}
					if (!esta)
						topicos.push(
						{
							topico: topico,
							subtopicos: [],
							filho: false,
							dispositivos: new Array()
						});
				}
			}

			if (topicos.length == 0)
				$("#topicos-conteudo").html("<h3 class = 'text-danger text-center'><b>Dispositivos inscritos em nenhum tópico</b></h3><p class = 'text-center'>Para inscrever um dispositivo em tópicos, entre nas <i>configurações</i> do dispositivo desejado na <a class = 'link' href = '/'><i>página inicial</i></a></p>");
			else
			{

				let arvore = GerarArvore(dispositivos, topicos);
				let htmlString = '<div class = "container">';
				htmlString += GerarHTML(arvore);
				htmlString += '</div>';
				$("#topicos-conteudo").html(htmlString);
			}
		}
	}

	function AtualizarLinha(codigo, valor)
	{
		let linha = $("#topicos-conteudo tbody tr[data-codigo='" + codigo + "']");
		linha.each(function ()
		{
			let tdimg;
			let tdbtn;
			if (serverdata.modoDebug)
			{
				tdimg = $(this).children().eq(2);
				tdbtn = $("button", $(this).children().eq(3));
			}

			else
			{
				tdimg = $(this).children().eq(1);
				tdbtn = $("button", $(this).children().eq(2));
			}

			if (valor == 1)
			{
				tdbtn.removeClass('btn-success');
				tdbtn.data('sonoff-toggle-valor', '0');
				tdbtn.addClass('btn-warning');
				tdbtn.html("Desligar");

				tdimg.removeClass('text-warning');
				tdimg.addClass('text-success');
				tdimg.html('Ligado <i class = "fa fa-toggle-on"></i>');

			}
			else
			{
				tdbtn.removeClass('btn-warning');
				tdbtn.data('sonoff-toggle-valor', '1');
				tdbtn.addClass('btn-success');
				tdbtn.html("Ligar");

				tdimg.removeClass('text-sucess');
				tdimg.addClass('text-warning');
				tdimg.html('Desligado <i class = "fa fa-toggle-off"></i>');
			}
		});
	}
	$("#topicos-conteudo").on('click', '.panel-heading span.clickable', function (e)
	{
		let $this = $(this);
		if (!$this.hasClass('panel-collapsed'))
		{
			$this.parent().next().slideUp();
			$this.addClass('panel-collapsed');
			$this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');

		}
		else
		{
			$this.parent().next().slideDown();
			$this.removeClass('panel-collapsed');
			$this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
		}
	});

	let podeAtualizar = true;
	$("#topicos-conteudo").on('click', '.btn-sonoff-toggle', function ()
	{
		if (!podeAtualizar)
			return;
		podeAtualizar = false;
		let codigo = $(this).data('codigo');
		let valor = $(this).data('sonoff-toggle-valor');
		$.ajax(
		{
			url: '/comandos/sonoff/togglepower',
			method: 'POST',
			data:
			{
				tipo: 'codigo',
				filtro: codigo,
				valor: valor
			},
			dataType: 'JSON',
			success: function (resposta)
			{
				utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
				AtualizarLinha(codigo, valor);

				podeAtualizar = true;
			},
			error: function ()
			{
				utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
			}

		});
	});

	$("#topicos-conteudo").on('click', '.btn-topico-toggle', function ()
	{
		if (!podeAtualizar)
			return;
		podeAtualizar = false;
		let topico = $(this).data('topico');
		let valor = $(this).data('sonoff-toggle-valor');
		let btn = $(this);
		$.ajax(
		{
			url: '/comandos/sonoff/togglepower',
			method: 'POST',
			data:
			{
				tipo: 'topico',
				filtro: topico,
				valor: valor
			},
			dataType: 'JSON',
			success: function (resposta)
			{

				utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
				podeAtualizar = true;
			},
			error: function ()
			{
				utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
			}

		});
	});

    $.ajax({
        url : 'comandos/sonoff/getsonoffs',
        method : 'GET',
        dataType : 'JSON',
        success : function(dispositivos)
        {
            GerarConteudo(dispositivos)
        },
        error : function(err)
        {
            utils.GerarNotificacao(err.responseText, 'danger')
        }

    })
	observer.Observar('socket-ready', function (socket)
	{
		socket.on('att estado sonoff', function (msg)
		{
			LimparObj(msg);
			for (let i = 0; i < msg.codigos.length; i++)
			{
				AtualizarLinha(msg.codigos[i], msg.valor);

			}
		});
		socket.on('att nome sonoff', function (msg)
		{
			LimparObj(msg);
			let linha = $("#topicos-conteudo tbody tr[data-codigo='" + msg.codigo + "']");
			linha.each(function ()
			{
				let tdnome;
				if (serverdata.modoDebug)
					tdnome = $(this).children().eq(1);
				else
					tdnome = $(this).first();
				tdnome.html(msg.nome);
			});

		});

		socket.on('topicos updated', function (msg)
		{
			LimparObj(msg);
			GerarConteudo(msg);
		});
	})

})