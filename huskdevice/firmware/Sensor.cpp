#include "Sensor.h"
#include <array>
#include <Arduino.h>

int husky::Sensor::getGPIO() const
{
	return GPIO;
}

void husky::Sensor::setGPIO(int gpio)
{
	GPIO = gpio;
}

husky::Sensor::Sensor(int gpio)
{
	ultimoIntervalo = millis();
	GPIO = gpio;
}
 
