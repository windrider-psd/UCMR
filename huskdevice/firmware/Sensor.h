#include <string>
#include <arduino.h>
#include <vector>
#include "utils.h"
#pragma once

namespace husky
{
	class Sensor
	{
		protected:
			int GPIO;
			std::vector<husky::MensagemMqtt> retornoExecucao;
		public:
			virtual std::vector<husky::MensagemMqtt> executar() = 0;
			int intervalo; //Intervalo de envio de dados para o ucmr
			unsigned long ultimoIntervalo = 10000;
			int getGPIO() const;
			void setGPIO(int);
			explicit Sensor(int);
	};

}


