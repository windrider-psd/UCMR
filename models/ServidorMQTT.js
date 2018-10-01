const mosca = require('mosca');

const models = require('./DBModels')
const ClienteMQTT = require('./ClienteMQTT')
const socket = require('./io')
class ServidorMQTT
{
	constructor(portamqtt, mongo, mqttusuario, mqttsenha, adminusuario, adminsenha)
	{
		this.dispositivosContagem = 1;
		this.novoDispositivoPrefixo = "dispositivo ";

		let OpcoesMosca = {
			type: 'mongo',
			url: mongo,
			pubsubCollection: 'ascoltatori',
			mong:{}
		};
		this.dispositivos = new Array();
		let moscaSettings = {
			port: portamqtt,
			backend: OpcoesMosca
		}
		let autenticar = (cliente, usuario, senha, callback) =>
		{
			console.log("tentativa de conexão:\nusuario: " + usuario.toString() + "\nsenha: " + senha.toString());
			let autorizadoRegular = (usuario.toString() == mqttusuario && senha.toString() == mqttsenha);
			let autorizadoAdmin = (usuario.toString() == adminusuario && senha.toString() == adminsenha);
			let autorizado = (autorizadoRegular || autorizadoAdmin);
			if (autorizado)
			{
				cliente.admin = autorizadoAdmin;
			}
			callback(null, autorizado);

		}
		let autorizarPublicacao = (cliente, topico, payload, callback) =>
		{
			callback(null, cliente.admin == true || topico.split('/')[0] == cliente.id);
		}
		let autorizarInscricao = (cliente, topico, callback) =>
		{
			callback(null, cliente.admin == true || topico.split('/')[0] == cliente.id);
		}
		this.server = new mosca.Server(moscaSettings);

		this.server.on('clientConnected', (client) =>
		{
			console.log('Cliente conectado', client.id);
			models.ModeloDispositivo.findOne(
			{
				idDispositivo: client.id
			}, (err, dispositivo) =>
			{
				let nome = this.novoDispositivoPrefixo + this.dispositivosContagem;
				if (err) throw err;

				else if (!dispositivo)
				{
					let debug = (client.id.indexOf("debug_") != -1) ? true : false;
					let salvar = new models.ModeloDispositivo(
					{
						idDispositivo: client.id,
						topicos: new Array(),
						nome: nome,
						debug: debug
					});
					salvar.save();
					this.AddDispositivo(new ClienteMQTT(client, nome));
				}
				else
				{
					let disp = new ClienteMQTT(client, dispositivo.nome);
					for (var i = 0; i < dispositivo.topicos.length; i++)
					{
						this.AddTopicos(dispositivo.topicos[i]);
					}
					this.AddDispositivo(disp);
				}
				this.dispositivosContagem++;
				new models.LogEventos(
				{
					tempo: new Date(),
					evento: "Dispositivo " + client.id + " conectado",
					tipo: 1
				}).save();
				let msg = this.GetSimpleDisp();
				socket.Emitir("update sonoff", msg);
				socket.Emitir("topicos updated", msg);
			});

		});
		this.server.on('published', (packet, client) =>
		{
			if (typeof (client) !== 'undefined')
			{
				var mensagem = packet.payload.toString();
                var topico = packet.topic.toString();

				new models.LogEventos(
				{
					tempo: new Date(),
					evento: "Cliente " + client.id + " publicou " + mensagem + " para " + topico,
					tipo: 1
				}).save();
				console.log('Publicado: ', mensagem);

				var parse = topico.split('/');
				try
				{
					var disp = this.GetDispositivo(parse[0]);
					if (parse[1] == 'status')
					{
						if (disp.status != mensagem)
						{
							models.ModeloDispositivo.findOne(
							{
								idDispositivo: parse[0]
							}, (err, dispositivo) =>
							{
								if (dispositivo.topicos.length > 0)
								{
									let mensagem = "sub\n";
									for (var i = 0; i < dispositivo.topicos.length; i++)
									{
										disp.AddTopicos(dispositivo.topicos[i]);
										mensagem += dispositivo.topicos[i];
										if (typeof (dispositivo.topicos[i + 1]) !== 'undefined')
										{
											mensagem += '\r';
										}
									}

									this.PublicarMensagem(parse[0], mensagem);
								}

								this.PublicarMensagem(parse[0], "sts\n1");
							});
						}
					}
					else if (parse[1] == 'ligado')
					{
						var novoestado = (mensagem == "1") ? true : false;
						disp.estado = novoestado;
						var codigos = new Array();
						codigos.push(parse[0]);
						var mensagem = {
							codigos: codigos,
							valor: novoestado
						};

						socket.Emitir('att estado sonoff', mensagem);
					}

				}
				catch (err)
				{}

			}

		});
		this.server.on('clientDisconnected', (client) =>
		{
			new models.LogEventos(
			{
				tempo: new Date(),
				evento: "Dispositivo " + client.id + " desconectado",
				tipo: 1
			}).save();
			models.ModeloDispositivo.findOne(
			{
				idDispositivo: client.id
			}, (err, resultado) =>
			{
				if (err) throw err;
				if (resultado)
				{
					var disp = this.GetDispositivo(client.id);
					resultado.topicos = disp.topicos;
					resultado.save();
				}
				this.SubDispositivo(client);
				var msg = this.GetSimpleDisp();
				socket.Emitir("update sonoff", msg);
				socket.Emitir("topicos updated", msg);
				console.log('Cliente ' + client.id + ' desconectou');
			});

		});
		this.server.on('ready', () =>
		{
			this.authenticate = autenticar;
			this.authorizePublish = autorizarPublicacao;
			this.authorizeSubscribe = autorizarInscricao;
		});
	}

	PublicarMensagem(topico, payload)
	{
		var message = {
			topic: topico,
			payload: payload,
			qos: 1,
			retain: false
		};

		this.server.publish(message);
		new models.LogEventos(
		{
			tempo: new Date(),
			evento: "Mensagem " + payload + " enviada pelo servidor para " + topico,
			tipo: 1
		}).save();
	}

	InscreverTopico(codigoDisp, topico, __callback)
	{
		models.ModeloDispositivo.findOne(
		{
			idDispositivo: codigoDisp
		}, (err, disp) =>
		{
			if (err)
			{
				__callback(err);
			}
			else if (disp != null)
			{
				if (disp.topicos.length > 5)
				{
					__callback("O número máximo de tópicos para um dispositivo é 5");
					return;
				}

				for (var i = 0; i < disp.topicos.length; i++)
				{
					if (disp.topicos[i] == topico)
					{
						__callback("Dispositivo já inscrito no tópico " + topico);
						return;
					}
				}

				try
				{
					var local = this.GetDispositivo(codigoDisp);
					local.topicos.push(topico);
				}
				catch (e)
				{}

				this.PublicarMensagem(codigoDisp, "sub\n" + topico);
				disp.topicos.push(topico);
				disp.save();
				__callback(null);
			}
			else
			{
				__callback("Dispositivo não encontrado");
			}
		});
	}
	DesinscreverTopico(codigoDisp, topico, __callback)
	{
		topico = topico.toLowerCase();
		models.ModeloDispositivo.findOne(
		{
			idDispositivo: codigoDisp
		}, (err, disp) =>
		{

			if (err)
			{
				__callback(err);
			}
			else if (disp != null)
			{
				try
				{
					var local = this.GetDispositivo(codigoDisp);
					local.SubTopicos(topico);
				}
				catch (e)
				{}

				this.PublicarMensagem(codigoDisp, "unsub\n" + topico);
				var index = disp.topicos.indexOf(topico);
				if (index != -1)
					disp.topicos.splice(index, 1);
				disp.save();
				__callback(null);
			}
			else
			{
				__callback("Dispositivo não encontrado");
			}
		});
	}

	//Apenas usar para debug
	AdicionarDispositivo(cliente, __callback)
	{
		this.dispositivos.push(cliente);
		if (typeof (__callback !== 'undefined'))
		{
			__callback();
		}
	}

	AddDispositivo(dispositivo)
	{
		this.dispositivos.push(dispositivo);
	}

	SubDispositivo(dispositivo)
	{
		for (var i = 0; i < this.dispositivos.length; i++)
		{
			if (dispositivo == this.dispositivos[i].hardware)
			{
				this.dispositivos.splice(i, 1);
				break;
			}
		}
	}

	GetSimpleDisp()
	{
		var retorno = new Array();
		for (var i = 0; i < this.dispositivos.length; i++)
		{
			retorno.push(this.dispositivos[i].ToSimpleOBJ());
		}
		return retorno;
	}
	GetDispositivo(codigo)
	{
		for (var i = 0; i < this.dispositivos.length; i++)
		{
			if (this.dispositivos[i].codigo == codigo)
				return this.dispositivos[i];
		}
		throw new Error("Dispositivo não encontrado");
	}
	GetDispInTopico(topico)
	{
		topico = topico.toLowerCase();
		var retorno = new Array();

		for (var i = 0; i < this.dispositivos.length; i++)
		{
			for (var j = 0; j < this.dispositivos[i].topicos.length; j++)
			{
				if (this.dispositivos[i].topicos[j].toLowerCase() == topico)
				{
					retorno.push(this.dispositivos[i].ToSimpleOBJ());
					break;
				}
			}
		}
		return retorno;
	}
	SetEstadoDispTopico(topico, estado)
	{
		topico = topico.toLowerCase();
		for (var i = 0; i < this.dispositivos.length; i++)
		{
			for (var j = 0; j < this.dispositivos[i].topicos.length; j++)
			{
				if (this.dispositivos[i].topicos[j].toLowerCase() == topico)
				{
					this.dispositivos[i].estado = estado;
					break;
				}
			}
		}
	}

}

module.exports = ServidorMQTT