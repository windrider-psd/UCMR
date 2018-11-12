#include "Sensor.h"
#include "DHT.h"
#pragma once
class DHT11Sensor : public Sensor 
{
	private:
		DHT dht;
		MensagemMqtt* mensagemHumidade;
		MensagemMqtt* mensagemTemperatura;
	public:
		virtual std::vector<MensagemMqtt> executar();
		DHT11Sensor(int);
};
