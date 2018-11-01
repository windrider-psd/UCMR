#include "SensorFactory.h"
#include "Sensor.h"
#include "LDR.h"
#include "pir.h"
#include <string.h>
#include <arduino.h>
#include <stdio.h>
#include <stdlib.h>
#include <memory>


SensorFactory::SensorFactory(){Serial.printf("olá\n");}

std::unique_ptr<Sensor> SensorFactory::CriarSensor(char *valorSensor, int gpio) 
{
    Serial.printf("%s\n", valorSensor);
    Serial.printf("%d\n", gpio);
    if(strcmp(valorSensor, "pir") == 0)
    {
        std::unique_ptr<Sensor> p (new PIR(gpio));
        return p;
    }
}
