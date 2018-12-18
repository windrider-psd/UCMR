#include "LDR.h"
std::vector<husky::MensagemMqtt> LDR::executar()
{
	int ldrValor = analogRead(GPIO);
	char strValor[5];

	strValor[0] = '\0';
	itoa(ldrValor, strValor, 10);
	
	this->mensagemLDR->payload.assign(strValor);

	return retornoExecucao;
}

LDR::LDR(int gpio) : Sensor(gpio)
{
	this->retornoExecucao.reserve(1);

	this->retornoExecucao.emplace_back("ldr", "");

	this->mensagemLDR = &this->retornoExecucao.at(0);

	pinMode(gpio, OUTPUT);
	intervalo = 30000;
}
