#include "pir.h"
#include <Arduino.h>
char* PIR::executar()
{
    Serial.printf("%d\n", GPIO);
    int valor = digitalRead(GPIO);
    Serial.printf("%d\n", valor);
    char* retorno = new char[2];
    retorno[0] = '\0';
    itoa(valor, retorno, 10);
    Serial.printf("%s\n", retorno);

    return retorno;
}

PIR::PIR(int gpio) : Sensor(gpio, "pir")
{
    Serial.printf("%d\n", gpio);
    pinMode(gpio, INPUT);
}
