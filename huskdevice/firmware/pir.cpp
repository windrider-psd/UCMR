#include "pir.h"
char* PIR::executar()
{
	int totalLeituras = 200;
	int totalMovimento = 0;
	for (int i = 0; i < totalLeituras; i++)
	{
		totalMovimento += digitalRead(GPIO);//+1 se movimento, se não, +0
		delay(10);
	}

	int valor = (totalMovimento >= (totalLeituras / 3)) ? 1 : 0;

	char* retorno = new char[2];
	retorno[0] = '\0';
	itoa(valor, retorno, 10);
	return retorno;
}

PIR::PIR(int gpio) : Sensor(gpio, "pir")
{
	intervalo = 3000;
	pinMode(gpio, INPUT);
}
