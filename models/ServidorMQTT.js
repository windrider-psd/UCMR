const mosca = require('mosca');

const models = require('./DBModels')
const ClienteMQTT = require('./ClienteMQTT')
const socket = require('./SocketIOServer').getIntance()
const chalk = require('chalk')
class ServidorMQTT
{
	setUp(portamqtt, mongo, mqttusuario, mqttsenha, adminusuario, adminsenha)
	{
		this.dispositivosContagem = 1;
		this.novoDispositivoPrefixo = "dispositivo ";
		this.intancia = this;
		let OpcoesMosca = {
			type: 'mongo',
			url: mongo,
			pubsubCollection: 'ascoltatori',
			mong:
			{}
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
					for (let i = 0; i < dispositivo.topicos.length; i++)
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
				let mensagem = packet.payload.toString();
				let topico = packet.topic.toString();

				new models.LogEventos(
				{
					tempo: new Date(),
					evento: "Cliente " + client.id + " publicou " + mensagem + " para " + topico,
					tipo: 1
				}).save();
				console.log('Publicado: ', mensagem);

				let parse = topico.split('/');
				try
				{
					let disp = this.GetDispositivo(parse[0]);
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
									for (let i = 0; i < dispositivo.topicos.length; i++)
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

								for(let i = 0; i < dispositivo.sensores.length; i++)
								{
									let string_mensagem = `add_sensor\n${dispositivo.sensores[i].tipo}\r${dispositivo.sensores[i].gpio}`
									this.PublicarMensagem(parse[0], string_mensagem);

									//this.AdicionarSensor(parse[0], dispositivo.sensores[i].tipo, dispositivo.sensores[i].gpio)
								}


							});
						}
					}
					else if (parse[1] == 'ligado')
					{
						let novoestado = (mensagem == "1") ? true : false;
						disp.estado = novoestado;
						let codigos = new Array();
						codigos.push(parse[0]);
						let mensagem = {
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
					let disp = this.GetDispositivo(client.id);
					resultado.topicos = disp.topicos;
					resultado.save();
				}
				this.SubDispositivo(client);
				let msg = this.GetSimpleDisp();
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
		let message = {
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
		console.log(chalk.green(`${topico}:${payload.replace(/\n/g, "\/n").replace(/\r/g, "\/r")}`))
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

				for (let i = 0; i < disp.topicos.length; i++)
				{
					if (disp.topicos[i] == topico)
					{
						__callback("Dispositivo já inscrito no tópico " + topico);
						return;
					}
				}

				try
				{
					let local = this.GetDispositivo(codigoDisp);
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
					let local = this.GetDispositivo(codigoDisp);
					local.SubTopicos(topico);
				}
				catch (e)
				{}

				this.PublicarMensagem(codigoDisp, "unsub\n" + topico);
				let index = disp.topicos.indexOf(topico);
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
		for (let i = 0; i < this.dispositivos.length; i++)
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
		let retorno = new Array();
		for (let i = 0; i < this.dispositivos.length; i++)
		{
			retorno.push(this.dispositivos[i].ToSimpleOBJ());
		}
		return retorno;
	}
	GetDispositivo(codigo)
	{
		for (let i = 0; i < this.dispositivos.length; i++)
		{
			if (this.dispositivos[i].codigo == codigo)
				return this.dispositivos[i];
		}
		return null
	}
	GetDispInTopico(topico)
	{
		topico = topico.toLowerCase();
		let retorno = new Array();

		for (let i = 0; i < this.dispositivos.length; i++)
		{
			for (let j = 0; j < this.dispositivos[i].topicos.length; j++)
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
		for (let i = 0; i < this.dispositivos.length; i++)
		{
			for (let j = 0; j < this.dispositivos[i].topicos.length; j++)
			{
				if (this.dispositivos[i].topicos[j].toLowerCase() == topico)
				{
					this.dispositivos[i].estado = estado;
					break;
				}
			}
		}
	}
	/**
	 * 
	 * @param {number} codigoDisp 
	 * @param {string} sensor 
	 * @param {string} gpio 
	 * @returns {Promise.<void>}
	 */
	AdicionarSensor(codigoDisp, sensor, gpio)
	{
		return new Promise((resolve, reject) => {
			models.ModeloDispositivo.findOne({idDispositivo: codigoDisp}, 
				(err, dispositivo) =>
				{
					if(err)
					{
						reject(err)
					}
					else if(!dispositivo)
					{
						reject(new Error("Device not found"))
					}
					else 
					{
						let gpio_valido = true
						for(let i = 0; i < dispositivo.sensores.length; i++)
						{
							if(dispositivo.sensores[i].gpio == gpio)
							{
								gpio_valido = false
								break
							}
						}
						if(gpio_valido)
						{
							dispositivo.sensores.push({tipo : sensor, gpio: gpio})
							dispositivo.save((err) => {
								if(err)
								{
									reject(err)
								}
								else
								{
									let string_topico = `${codigoDisp}`
									let string_mensagem = `add_sensor\n${sensor}\r${gpio}`
									this.PublicarMensagem(string_topico, string_mensagem);

									resolve()
								}
							})
						}
						else
						{
							reject(new Error("Only one sensor can use the same gpio"))
						}
						
					}
				}
			)
		})
		
	}

	/**
	 * 
	 * @param {number} codigoDisp 
	 * @param {string} sensor 
	 * @param {string} gpio 
	 * @returns {Promise.<void>}
	 */
	RemoverSensor(codigoDisp, gpio)
	{
		return new Promise((resolve, reject) => {
			models.ModeloDispositivo.findOne({idDispositivo: codigoDisp}, 
				(err, dispositivo) =>
				{
					if(err)
					{
						reject(err)
					}
					else if(!dispositivo)
					{
						reject(new Error("Device not found"))
					}
					else 
					{
						for(let i = 0; i < dispositivo.sensores.length; i++)
						{
							if(dispositivo.sensores[i].gpio == gpio)
							{
								dispositivo.sensores.splice(i, 1);
								break
							}
						}
						dispositivo.save((err) => {
							if(err)
							{
								reject(err)
							}
							else
							{
								let string_topico = `${codigoDisp}`
								let string_mensagem = `rem_sensor\n${gpio}`
								this.PublicarMensagem(string_topico, string_mensagem);

								resolve()
							}
						})
						
						
					}
				}
			)
		})
	}

	/**
	 * 
	 * @param {number} codigoDisp 
	 * @param {string} sensor 
	 * @param {string} gpio 
	 * @returns {Promise.<void>}
	 */
	EditarGPIOSensor(codigoDisp, sensor, gpio)
	{
		return new Promise((resolve, reject) => {
			models.ModeloDispositivo.findOne({idDispositivo: codigoDisp}, 
				(err, dispositivo) =>
				{
					if(err)
					{
						reject(err)
					}
					else if(!dispositivo)
					{
						reject(new Error("Device not found"))
					}
					else 
					{
						let indexSensor = null;
						for(let i = 0; i < dispositivo.sensores.length; i++)
						{
							if(dispositivo.sensores.tipo != sensor && dispositivo.sensores.gpio == gpio)
							{
								reject("Another sensor has this gpio")
								return
							}
							else if(dispositivo.sensores[i].tipo == sensor)
							{
								indexSensor = i;
							}
						}
						if(indexSensor)
						{
							let gpioAntigo = dispositivo.sensores[indexSensor].gpio

							let string_topico = `${codigoDisp}/edit_sensor`
							let string_mensagem = `${gpioAntigo}\r${gpio}`

							dispositivo.sensores[indexSensor].gpio = gpio
							dispositivo.save((err) => {
								if(err)
								{
									reject(err)
								}
								else
								{
									this.PublicarMensagem(string_topico, string_mensagem);
									resolve()
								}
							})
						}
						else
						{
							reject("Sensor not found")
						}
						dispositivo.save((err) => {
							if(err)
							{
								reject(err)
							}
							else
							{
								let string_topico = `${codigoDisp}/rem_sensor`
								let string_mensagem = `${gpio}`
								this.PublicarMensagem(string_topico, string_mensagem);

								resolve()
							}
						})
						
						
					}
				}
			)
		})
	}

	/**
	 * 
	 * @param {String} nome 
	 * @param {boolean} carga 
	 */
	setCargaDispositivoPorNome(nome, carga)
	{
		let dispo = this.GetSimpleDisp()
		for(let i = 0; i < dispo.length; i++)
		{
			if(nome == dispo[i].nome)
			{
				let disp = this.GetDispositivo(dispo[i].codigo);
				if(!disp)
				{
					return false
				}

				disp.Estado = carga
				this.PublicarMensagem(`${disp.codigo},'tp\n/${(carga) ? '1' : '0'}`)
				let mensagem = {codigos : new Array(disp.codigo), valor : carga}

				socket.Emitir('att estado sonoff', mensagem)
				return true
			}
		}
		return false
	}

	setCargaDispositivoPorId(id, carga)
	{
		let disp = this.GetDispositivo(id);
		if(!disp)
		{
			return false
		}

		disp.Estado = carga
		this.PublicarMensagem(disp.codigo, `tp\n/${(carga) ? '1' : '0'}`)
		let mensagem = {codigos : new Array(disp.codigo), valor : carga}	
		socket.Emitir('att estado sonoff', mensagem)
		return true
	}


	setCargaDispositivoPorTopico(topico, carga)
	{
		this.PublicarMensagem(topico,`tp\n${(carga) ? '1' : '0'}`);

		this.SetEstadoDispTopico(topico, carga);

		let disp = this.GetDispInTopico(topico);
		let codigos = []
		for(let i = 0; i < disp.length; i++)
		{
			codigos.push(disp[i].codigo);
		}
		let mensagem = {codigos : codigos, valor : ligar};

		socket.Emitir('att estado sonoff', mensagem);
	}

}

module.exports = new ServidorMQTT()