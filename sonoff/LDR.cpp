#include "LDR.h"
#include <Arduino.h>

char* LDR::executar()
{
    int ldrvalor = analogRead(GPIO);
    char* retorno = new char[5];
    retorno[0] = '\0';
    itoa(ldrvalor, retorno, 10);
    return retorno;
}
