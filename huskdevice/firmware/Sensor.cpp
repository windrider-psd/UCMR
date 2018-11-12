#include "Sensor.h"
#include <Arduino.h>
int Sensor::getGPIO() const
{
	return GPIO;
}

void Sensor::setGPIO(int gpio)
{
	GPIO = gpio;
}

Sensor::Sensor(int gpio)
{
	ultimoIntervalo = millis();
	GPIO = gpio;
}
 