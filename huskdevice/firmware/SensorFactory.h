#include "Sensor.h"
#include <memory>
#pragma once
class SensorFactory
{
	private:
		SensorFactory();
	public:
		static std::unique_ptr<husky::Sensor> CriarSensor(const std::string&, int);
};

