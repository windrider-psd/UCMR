#include <string>

#pragma once
namespace husky
{
	enum TipoUpload
	{
		SONOFF_BASIC, SONOFF_POW, NODE_MCU
	};

	struct MensagemMqtt {
		std::string topico;
		std::string payload;
		MensagemMqtt(std::string topico, std::string payload) : topico(topico), payload(payload)
		{
		}
	};
}
