#include "Sensor.h"
#include "HLW8012.h"
#pragma once
class HLW8012Sensor : public Sensor {
	private:
		HLW8012 hlw8012;
		static int const SEL_PIN = 5;
		static int const CF1_PIN = 13;
		static int const CF_PIN = 14;
		MensagemMqtt* mensagemTensao;
		MensagemMqtt* mensagemCorrente;
		MensagemMqtt* mensagemPotencia;
	public:
		virtual std::vector<MensagemMqtt> executar();
		void unblockingDelay(unsigned long);
		void calibrate();
		HLW8012Sensor(int);
};

