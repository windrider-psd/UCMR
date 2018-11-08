
#include <list>
#include "SensorFactory.h"
#include "Sensor.h"
#include "firmware_enum.h"
#include <memory>
#include <vector>
#include "PubSubClient.h"
#include <ESP8266WiFi.h>
#pragma once
class HuskDevice
{
	protected:
		TipoUpload tipo;
		int OUTPUT_PIN;
		int LED_PIN;
		int BTN_PIN;
		int BTN_ESTADO = 0;
		bool LOGICA_INV_LED;
		char SONOFF_STATUS;
		int SONOFF_LIGADO = 0;
		char* ID_CLIENTE;
		char* MQTT_USER;
		char* MQTT_PASSWORD;
		std::vector<char*> topicos;
		WiFiClient espClient;
		PubSubClient MQTT;
		void CriarID();
		void LigarLed();
		void DesligarLed();
		void LigarSonoff();
		void DesligarSonoff();
		void EnviarMensagemLigado();
		void EnviarMensagemStatus();
		void VerificarBtn();
		std::vector<std::unique_ptr<Sensor>> sensores;

	public:
		void InscreverTodosTopicos();
		void AdicionarTopico(char*);
		void RemoverTopico(char*);
		void ImprimirTopicos() const;
		void ReconnectMQTT();
		void ReconnectWiFi();
		void Loop();
		void mqtt_callback(char* topic, byte* payload, unsigned int length);
		void Iniciar();
		void Conectar(const char*, const char*, const char*, int, const char*, const char*);
		int GetOutput() const;
		int GetLed() const;
		int GetBtn() const;
		char GetStatus() const;
		char* GetID() const;
		PubSubClient GetMQTT() const;
		explicit HuskDevice(TipoUpload);
		void AdicionarSensor(std::unique_ptr<Sensor>);
		void RemoverSensor(int);
};

