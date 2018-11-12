#include "microondas.h"


std::vector<MensagemMqtt> Microondas::executar()
{
	int valor = digitalRead(GPIO);
	char valorSTR[2];
	valorSTR[0] = '\0';
	itoa(valor, valorSTR, 10);
	mensagemMicroondas->payload.assign(valorSTR);
	return retornoExecucao;
}

Microondas::Microondas(int gpio) : Sensor(gpio)
{
	MensagemMqtt tmpMicro;
	tmpMicro.topico = "microondas";
	
	this->retornoExecucao.push_back(tmpMicro);
	this->mensagemMicroondas = &this->retornoExecucao.at(0);

	pinMode(gpio, INPUT);
}

