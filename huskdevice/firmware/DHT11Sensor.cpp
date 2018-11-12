#include "DHT.h"
#include "DHT11Sensor.h"
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <Arduino.h>

#define DHTTYPE DHT11

std::vector<MensagemMqtt> DHT11Sensor::executar()
{	
	float humidade = dht.readHumidity();
	float temperatura = dht.readTemperature();

	char hSTR[7];
	char tSTR[7];
	snprintf(hSTR, sizeof(hSTR), "%.0f", humidade);
	snprintf(tSTR, sizeof(tSTR), "%.0f", temperatura);
	
	this->mensagemHumidade->payload.assign(hSTR);
	this->mensagemTemperatura->payload.assign(tSTR);
	return retornoExecucao;
}

DHT11Sensor::DHT11Sensor(int gpio) : Sensor(gpio)
{
	MensagemMqtt tmpHumidade;
	MensagemMqtt tmpTemperatura;

	tmpHumidade.topico = "humidade";
	tmpTemperatura.topico = "temperatura";

	this->retornoExecucao.push_back(tmpHumidade);
	this->retornoExecucao.push_back(tmpTemperatura);

	this->mensagemHumidade = &this->retornoExecucao.at(0);
	this->mensagemTemperatura = &this->retornoExecucao.at(1);

	this->intervalo = 60000;

	dht = DHT(gpio, DHTTYPE);
	dht.begin();	
}