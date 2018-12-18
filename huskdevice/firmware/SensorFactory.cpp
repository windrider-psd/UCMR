#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include "LDR.h"
#include "DHT11Sensor.h"
#include "HLW8012Sensor.h"
#include "microondas.h"
#include "patch.h"

SensorFactory::SensorFactory() {}

std::unique_ptr<husky::Sensor> SensorFactory::CriarSensor(const std::string& valorSensor, int gpio)
{	
	std::unique_ptr<husky::Sensor> sensor;

	if (valorSensor == "pir")
	{
		sensor = std::unique_ptr<husky::Sensor>(patch::make_unique<PIR>(gpio));
	}
	else if (valorSensor == "dht11")
	{
		sensor = std::unique_ptr<husky::Sensor>(patch::make_unique<DHT11Sensor>(gpio));
	}
	else if (valorSensor == "ldr")
	{
		sensor = std::unique_ptr<husky::Sensor>(patch::make_unique<LDR>(gpio));
	}
	else if (valorSensor == "ondas")
	{
		sensor = std::unique_ptr<husky::Sensor>(patch::make_unique<Microondas>(gpio));
	}
	else if (valorSensor == "hlw8012")
	{
		sensor = std::unique_ptr<husky::Sensor>(patch::make_unique<HLW8012Sensor>(gpio));
	}
	return sensor;
}
