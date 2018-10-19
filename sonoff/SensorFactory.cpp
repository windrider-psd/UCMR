#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include <string.h>

SensorFactory::SensorFactory(){Serial.printf("olá\n");}

Sensor SensorFactory::CriarSensor(char *valorSensor, int gpio) 
{
    Serial.printf("%s\n", valorSensor);
    Serial.printf("%d\n", gpio);
    if(strcmp(valorSensor, "pir") == 0)
    {
        return PIR(gpio);
    }
}
