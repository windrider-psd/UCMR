#include "pir.h"
#include <Arduino.h>

char* PIR::executar()
{
    int valor = digitalRead(GPIO);
    //Serial.print(valor);
    char* retorno = new char[2];
    retorno[0] = '\0';
    itoa(valor, retorno, 10);

    return retorno;
}

PIR::PIR(int gpio) : Sensor(gpio, "pir")
{
    pinMode(gpio, INPUT);
}
