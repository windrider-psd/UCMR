#include <string>
#include <vector>
#include <memory>
#include <utils.h>
#include <ESP8266WiFi.h>
#include "Sensor.h"
#pragma once
class HuskyDevice
{
	protected:
		std::vector<std::string> topicos;
		std::vector<std::shared_ptr<husky::Sensor>> sensores;
		std::unique_ptr<husky::ReceptorIV> receptorIV;
		
		void enviarMensagemStatus() const;
		void inscreverTodosTopicos() const;
		void AdicionarTopico(std::string);
		void RemoverTopico(std::string);
		void ReconnectMQTT();
		void mqtt_callback(char* topic, byte* payload, unsigned int length);
		void Conectar(const std::string, const std::string, const std::string, int, const std::string, const std::string);
		void criarID() const;

	public:
		std::string idCliente;
		boolean estadoConexao;
		std::string usuarioMQTT;
		std::string senhaMQTT;
		WiFiClient espClient;
		PubSubClient MQTT;


		void enviarMensagem(std::string, const std::string) const;

		explicit HuskyDevice();
		~HuskyDevice();
};

