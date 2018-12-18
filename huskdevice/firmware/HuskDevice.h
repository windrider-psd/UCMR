
#include <list>
#include "SensorFactory.h"
#include "Sensor.h"
#include "utils.h"
#include <memory>
#include <vector>
#include "PubSubClient.h"
#include "ReceptorIV.h"
#include <ESP8266WiFi.h>
#pragma once
class HuskDevice
{
	protected:
		husky::TipoUpload tipo;
		int OUTPUT_PIN;
		int LED_PIN;
		int BTN_PIN;
		int BTN_ESTADO = 0;
		bool LOGICA_INV_LED;
		char SONOFF_STATUS;
		int SONOFF_LIGADO = 0;
		std::string ID_CLIENTE;
		std::string MQTT_USER;
		std::string MQTT_PASSWORD;
		std::vector<std::string> topicos;
		WiFiClient espClient;
		PubSubClient MQTT;
		void CriarID();
		void LigarLed();
		void DesligarLed();
		void LigarSonoff();
		void DesligarSonoff();
		void EnviarMensagemLigado();
		void EnviarMensagemStatus();
		void EnviarMensagemTipo();
		void VerificarBtn();
		std::vector<std::unique_ptr<husky::Sensor>> sensores;
		std::unique_ptr<husky::ReceptorIV> receptorIV;
	public:
		void InscreverTodosTopicos();
		void AdicionarTopico(std::string);
		void RemoverTopico(std::string);
		void ImprimirTopicos() const;
		void ReconnectMQTT();
		void ReconnectWiFi();
		void Loop();
		void mqtt_callback(char* topic, byte* payload, unsigned int length);
		void Iniciar();
		void Conectar(const std::string, const std::string, const std::string, int, const std::string, const std::string);
		int GetOutput() const;
		int GetLed() const;
		int GetBtn() const;
		char GetStatus() const;
		std::string GetID() const;
		PubSubClient GetMQTT() const;
		explicit HuskDevice(husky::TipoUpload d);
		void AdicionarSensor(std::unique_ptr<husky::Sensor>);
		void RemoverSensor(int);
};

