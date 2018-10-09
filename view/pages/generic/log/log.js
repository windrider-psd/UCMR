let $ = require('jquery')
let utils = require('../../generic/utils')

const resultadosPorPagina = 15;
const periodoPaginas = 4;
let listaCategorias = [];
let tipoAtual;
let LogData;
let paginaAtual;
let totaldePaginas;

function TipoToString(tipo)
{

	tipo = Number(tipo);
	let tipoString;
	switch (tipo)
	{
		case 0:
			tipoString = "Geral";
			break;
		case 1:
			tipoString = "Dispositivos";
			break;
		case 2:
			tipoString = "Painel Solar";
			break;
		default:
			tipoString = "Outro";
	}
	return tipoString;
}

function TrocarTab(tipo)
{
	if (tipo == tipoAtual)
	{
		return;
	}
	tipoAtual = tipo;
	$(".tab-btn").parent().removeClass("active");
	$('.tab-btn[data-tipo="' + tipo + '"]').parent().addClass("active");
	let htmlString = '<div class="table-responsive"> <table class="table table-striped table-bordered"> <thead> <tr> <th>Evento</th> <th>Horário</th> </tr></thead> <tbody id="log-tbody">';
	let paginacaoString = '<ul class="pagination">';
	let i = 0
	for (; i < listaCategorias.length; i++)
	{
		if (listaCategorias[i].tipo == tipo)
		{
			htmlString += GerarHTMLTabela(listaCategorias[i].logs, 0);
			break;
		}
	}
	paginacaoString += GerarHTMLPaginacao(listaCategorias[i].logs, 0);
	paginacaoString += '</ul>';
	htmlString += "</tbody> </table>" + paginacaoString + "</div>";
	$(".tab-content").html(htmlString);
	paginaAtual = 0;
	VerificarProximo();
	EnconderPaginacao();
}


function GerarCategorias(data)
{
	let categorias = [0, 1, 2];
	let tabsString = '';
	for (let i = 0; i < categorias.length; i++)
	{
		listaCategorias.push(
		{
			tipo: categorias[i],
			nome: TipoToString(categorias[i]),
			logs: []
		});
	}
	for (let i = 0; i < listaCategorias.length; i++)
	{
		tabsString += '<li><a class = "tab-btn" data-tipo = "' + listaCategorias[i].tipo + '"">' + listaCategorias[i].nome + '</a></li>';

		for (let j = 0; j < data.length; j++)
		{
			if (data[j].tipo == listaCategorias[i].tipo)
			{
				listaCategorias[i].logs.push(data[j]);
			}
		}
	}

	$(".nav-tabs").html(tabsString);
}


function TrocarPagina(novaPagina)
{
	$('.paginacao_pagina').parent().removeClass("active");
	$('.paginacao_pagina[data-idpagina="' + novaPagina + '"]').parent().addClass("active");
	for (let i = 0; i < listaCategorias.length; i++)
	{
		if (listaCategorias[i].tipo == tipoAtual)
		{
			$("#log-tbody").html(GerarHTMLTabela(listaCategorias[i].logs, novaPagina * resultadosPorPagina));
			break;
		}
	}
	paginaAtual = novaPagina;
	VerificarProximo();
	EnconderPaginacao();
}

function VerificarProximo()
{
	if (paginaAtual >= totaldePaginas - 1)
	{
		$("#paginacao-proximo").addClass("hidden");
	}
	else
	{
		$("#paginacao-proximo").removeClass("hidden");
	}

	if (paginaAtual <= 0)
	{
		$("#paginacao-anterior").addClass("hidden");
	}
	else
	{
		$("#paginacao-anterior").removeClass("hidden");
	}
}

function EnconderPaginacao()
{
	$(".paginacao_dots").remove();
	$(".paginacao_pagina").removeClass("hidden");
	let j = paginaAtual + periodoPaginas + 1;
	if (j < totaldePaginas - 1)
	{
		$('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j).parent());

	}
	for (; j < totaldePaginas - 1; j++)
	{
		$(".paginacao_pagina").eq(j).addClass("hidden");
	}

	j = paginaAtual - periodoPaginas - 1;
	if (j > 0)
	{
		$('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j).parent());
	}
	for (; j > 0; j--)
	{
		$(".paginacao_pagina").eq(j).addClass("hidden");
	}
}

function AvancarPagina(proxima)
{
	let nova = paginaAtual + proxima;
	let novapaginaReal;
	if (nova > totaldePaginas - 1)
	{
		novapaginaReal = totaldePaginas - 1;
	}
	else if (nova < 0)
	{
		novapaginaReal = 0;
	}
	else
	{
		novapaginaReal = nova;
	}
	TrocarPagina(novapaginaReal);


}

function GerarHTMLTabela(data, offset)
{
	let htmlStringTabela = "";
	let i = offset;
	let limiteReal = i + resultadosPorPagina;

	for (; i <= limiteReal && i < data.length; i++)
	{
		data[i].evento = data[i].evento.replace('\n', '\n');
		data[i].evento = data[i].evento.replace('\r', '\r');
		htmlStringTabela += "<tr data-id = '" + data[i]._id + "'><td>" + data[i].evento + "</td><td>" + utils.FormatarDate(data[i].tempo, "/") + "</td></tr>";
	}

	return htmlStringTabela;
}

function GerarHTMLPaginacao(data, ativoIndex)
{
	let paginacaoString = '<li><a rel="next" id = "paginacao-anterior" onclick="AvancarPagina(-1)" style = "cursor:pointer">Anterior</a></li>';
	let totalPaginas = Math.ceil(data.length / resultadosPorPagina);
	totaldePaginas = totalPaginas;
	for (let i = 0; i < totalPaginas; i++)
	{
		paginacaoString += '<li';
		if (i == ativoIndex)
		{
			paginacaoString += ' class = "active"';
		}
		paginacaoString += '><a class="paginacao_pagina" data-idpagina="' + i + '">' + (i + 1) + '</a></li>';
	}
	paginacaoString += '<li><a rel="next" id = "paginacao-proximo" onclick="AvancarPagina(1)" style = "cursor:pointer">Próxima</a></li>';
	paginacaoString += '<form style = "display:inline" id = "form-goto" onsubmit="return false" class = "form-inline"><div class="form-group"><input type="number" id = "paginacao_goto" class = "form-control"/></div><button class = "btn btn-primary" type="submit" id="changePage">Ir</button></form>';
	return paginacaoString;
}


function CarregarLogData()
{
	$.ajax(
	{
		method: 'GET',
		url: 'comandos/log/getlog',
		dataType: 'JSON',
		success: function (resposta)
		{
			if (resposta.mensagem.tipo != "success")
			{
				utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
			}
			else
			{
				GerarCategorias(resposta.log);
				TrocarTab(listaCategorias[0].tipo);
			}

		},
		error: function ()
		{
			utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
		}
	});
}
$(document).ready(function()
{
	$(".tab-content").on('click', ".paginacao_pagina", function ()
	{
		let pagina = $(this).data('idpagina');
		TrocarPagina(pagina);
	});

	$("#btn-excluir-log").on('click', function ()
	{
		let excluir = function ()
		{
			$.ajax(
			{
				method: 'GET',
				url: 'comandos/log/excluir',
				dataType: 'JSON',
				success: function (resposta)
				{
					utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
					if (resposta.mensagem.tipo == "success")
					{
						$("#log-tbody").html("");
						$(".pagination").html("");
						for (let i = 0; i < listaCategorias.length; i++)
						{
							listaCategorias[i].logs = [];
						}
					}
				},
				error: function ()
				{
					utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
				}
			});
		}

		GerarConfirmacao("Tens certeza que desejas excluir o log?", excluir);
	});

	$(".tab-content").on('submit', "#form-goto", function ()
	{
		let input = Number($("input", $(this)).val());
		if (isNaN(input))
		{
			utils.GerarNotificacao("Digite um número para a página", "warning");
			return;
		}

		if (input - 1 <= totaldePaginas)
		{
			TrocarPagina(input - 1);
		}
		else
		{
			utils.GerarNotificacao("A página digitada não existe", "warning");
		}

	});
	$(".nav-tabs").on('click', '.tab-btn', function ()
	{
		let tipo = $(this).data('tipo');
		TrocarTab(tipo)
	})

	CarregarLogData();
})