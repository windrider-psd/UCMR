#include "microondas.h"


std::vector<husky::MensagemMqtt> Microondas::executar()
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
	this->retornoExecucao.reserve(1);

	this->retornoExecucao.emplace_back("microondas", "");

	this->mensagemMicroondas = &this->retornoExecucao.at(0);

	pinMode(gpio, INPUT);
}

