#include "LDR.h"
std::vector<MensagemMqtt> LDR::executar()
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
	MensagemMqtt tmpLDR;
	tmpLDR.topico = "ldr";
	this->retornoExecucao.push_back(tmpLDR);
	this->mensagemLDR = &this->retornoExecucao.at(0);

	pinMode(gpio, OUTPUT);
	intervalo = 30000;
}
