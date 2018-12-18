#include "Sensor.h"
#include "HLW8012.h"
#pragma once
class HLW8012Sensor : public husky::Sensor {
	private:
		HLW8012 hlw8012;
		static int const SEL_PIN = 5;
		static int const CF1_PIN = 13;
		static int const CF_PIN = 14;
		husky::MensagemMqtt* mensagemTensao;
		husky::MensagemMqtt* mensagemCorrente;
		husky::MensagemMqtt* mensagemPotencia;
	public:
		virtual std::vector<husky::MensagemMqtt> executar();
		void unblockingDelay(unsigned long);
		void calibrate();
		HLW8012Sensor(int);
};

