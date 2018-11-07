#include "Sensor.h"
#include <Arduino.h>
int Sensor::getGPIO() const
{
    return GPIO;
}

void Sensor::setGPIO(int gpio)
{
    GPIO = gpio;
}

char* Sensor::getNome() const
{
    return nome;
}

void Sensor::setNome(char* novonome)
{
    nome = novonome;
}


Sensor::Sensor(int gpio, char* nomes)
{
    ultimoIntervalo = millis();
    GPIO = gpio;
    nome = nomes;
}
