#include "Sensor.h"
#pragma once
class PIR : public Sensor {

	private:
		MensagemMqtt* mensagemPIR;

	public:
		virtual std::vector<MensagemMqtt> executar();
		PIR(int);
};

