#include "pir.h"
std::vector<MensagemMqtt> PIR::executar()
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

PIR::PIR(int gpio) : Sensor(gpio                                               )
{
	MensagemMqtt tmpPIR;
	tmpPIR.topico = "pir";
	this->retornoExecucao.push_back(tmpPIR);
	this->mensagemPIR = &this->retornoExecucao.at(0);

	intervalo = 3000;
	pinMode(gpio, INPUT);
}
