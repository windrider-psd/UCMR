
#include <string>
#include <memory>
#include "Sensor.h"
#pragma once
class SensorFactory
{
	private:
		SensorFactory();
	public:
		static std::unique_ptr<Sensor> CriarSensor(char*, int);
};

