#include "Sensor.h"
#pragma once
class PIR : public husky::Sensor {

	private:
		husky::MensagemMqtt* mensagemPIR;

	public:
		virtual std::vector<husky::MensagemMqtt> executar();
		PIR(int);
};

