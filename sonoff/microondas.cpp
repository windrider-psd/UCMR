#include "microondas.h"
#include <Arduino.h>

char* Microondas::executar()
{
    int valor = digitalRead(GPIO);
    char* retorno = new char[2];
    retorno[0] = '\0';
    itoa(valor, retorno, 10);
    return retorno;
}

Microondas::Microondas(int gpio) : Sensor(gpio, "microondas")
{
    pinMode(gpio, INPUT);
}
