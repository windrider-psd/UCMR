#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include <string.h>

SensorFactory::SensorFactory(){}

Sensor SensorFactory::CriarSensor(char *valorSensor, int gpio) 
{
    if(strcmp(valorSensor, "pir") == 0)
    {
        return PIR(gpio);
    }
}
