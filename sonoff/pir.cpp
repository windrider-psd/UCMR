#include "pir.h"
#include <Arduino.h>
char* PIR::executar()
{

    int valor = digitalRead(GPIO);
    char* retorno = new char[2];
    retorno[0] = '\0';
    itoa(valor, retorno, 10);
    Serial.printf("%d\n", valor);
    return retorno;
}

PIR::PIR(int gpio) : Sensor(gpio, "pir")
{
    Serial.printf("%d\n", gpio);
    pinMode(gpio, INPUT);
   
}
