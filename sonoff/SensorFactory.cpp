#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include "DHT11Sensor.h"
#include <string.h>
#include <arduino.h>
#include <stdio.h>
#include <stdlib.h>
#include <memory>

SensorFactory::SensorFactory(){}

std::unique_ptr<Sensor> SensorFactory::CriarSensor(char *valorSensor, int gpio) 
{
    if(strcmp(valorSensor, "pir") == 0)
    {
        std::unique_ptr<Sensor> p (new PIR(gpio));
        return p;
    }
    else if(strcmp(valorSensor, "dht11") == 0)
    {
        std::unique_ptr<Sensor> p (new DHT11Sensor(gpio));
        return p;
    }
}
