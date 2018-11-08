#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include "LDR.h"
#include "DHT11Sensor.h"
#include "HLW8012Sensor.h"
#include "microondas.h"
#include "patch.h"
#include <string.h>
#include <arduino.h>
#include <stdio.h>
#include <stdlib.h>
#include <memory>

SensorFactory::SensorFactory() {}

std::unique_ptr<Sensor> SensorFactory::CriarSensor(char *valorSensor, int gpio)
{	
	std::unique_ptr<Sensor> sensor;
	
	if (strcmp(valorSensor, "pir") == 0)
	{
		sensor = std::unique_ptr<Sensor>(patch::make_unique<PIR>(gpio));
	}
	else if (strcmp(valorSensor, "dht11") == 0)
	{
		sensor = std::unique_ptr<Sensor>(patch::make_unique<DHT11Sensor>(gpio));
	}
	else if (strcmp(valorSensor, "ldr") == 0)
	{
		sensor = std::unique_ptr<Sensor>(patch::make_unique<LDR>(gpio));
	}
	else if (strcmp(valorSensor, "ondas") == 0)
	{
		sensor = std::unique_ptr<Sensor>(patch::make_unique<Microondas>(gpio));
	}
	else if (strcmp(valorSensor, "hlw8012") == 0)
	{
		sensor = std::unique_ptr<Sensor>(patch::make_unique<HLW8012Sensor>(gpio));
	}
	return sensor;
}
