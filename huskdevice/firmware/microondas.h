#pragma once
#include "Sensor.h"
class Microondas : public Sensor 
{
	private:
		MensagemMqtt* mensagemMicroondas;
	public:
		virtual std::vector<MensagemMqtt> executar();
		Microondas(int);
};


