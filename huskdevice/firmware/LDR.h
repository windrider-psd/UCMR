#pragma once
#include "Sensor.h"
class LDR : public Sensor {
	private:
		MensagemMqtt* mensagemLDR;
	public:
		virtual std::vector<MensagemMqtt> executar();
		LDR(int);
};

