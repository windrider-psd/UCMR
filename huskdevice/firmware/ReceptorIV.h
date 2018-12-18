#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRutils.h>
#include <functional>

typedef std::function<void(decode_results)> callback_signature;


namespace husky
{
	#pragma once
	class ReceptorIV
	{
		private:
			short unsigned int gpio;
			IRrecv receptor;
			decode_results resultadosReceptor;
			callback_signature callback;
		public:
			unsigned int getGPIO() const { return this->gpio; };
			void setGPIO(unsigned int);
			void setCallback(callback_signature);
			explicit ReceptorIV(unsigned int);
			void lerReceptor();

			~ReceptorIV();
	};
}


