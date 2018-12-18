#include "pir.h"
std::vector<husky::MensagemMqtt> PIR::executar()
{
	int totalLeituras = 200;
	int totalMovimento = 0;
	for (int i = 0; i < totalLeituras; i++)
	{
		totalMovimento += digitalRead(GPIO);//+1 se movimento, se não, +0                                                  
		delay(1);
	}

	(totalMovimento >= (totalLeituras / 2)) ? mensagemPIR->payload.assign("1") : mensagemPIR->payload.assign("0");
	return retornoExecucao;

}

PIR::PIR(int gpio) : husky::Sensor(gpio)
{
	this->retornoExecucao.reserve(1);

	this->retornoExecucao.emplace_back("pir", "");

	this->mensagemPIR = &this->retornoExecucao.at(0);

	intervalo = 3000;
	pinMode(gpio, INPUT);
}
