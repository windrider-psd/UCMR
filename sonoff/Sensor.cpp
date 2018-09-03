#include "Sensor.h"

int Sensor::getGPIO() const
{
    return GPIO;
}

void Sensor::setGPIO(int gpio)
{
    GPIO = gpio;
}

std::string Sensor::getNome() const
{
    return nome;
}

void Sensor::setNome(std::string novonome)
{
    nome = novonome;
}


Sensor::Sensor(int gpio, std::string nomes)
{
    GPIO = gpio;
    nome = nomes;
    pinmode(gpio, OUTPUT);
}