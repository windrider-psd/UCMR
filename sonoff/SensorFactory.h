#ifndef SENSOR_FACTORY_H
#define SENSOR_FACTORY_H
#include <string>
#include <memory>
#include "Sensor.h"
class SensorFactory 
{
    public:
        SensorFactory();
        std::unique_ptr<Sensor> CriarSensor(char*, int);
};

#endif
