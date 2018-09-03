#include 'LDR.h'

char* LDR::executar()
{
    int ldrvalor = analogread(GPIO);
    char* retorno = new char[5];
    retorno[0] = '\0';
    itoa(ldrvalor, retorno, 10);
    return retorno;
}