#include "DHT.h"
#include "DHT11Sensor.h"
#define DHTTYPE DHT11
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <Arduino.h>


char* DHT11Sensor::executar()
{
    float humidade = dht.readHumidity();
    float temperatura = dht.readTemperature();
    
    /*if(isnan(humidade) )
    {
      humidade = 0;
    }
    if(isnan(temperatura))
    {
      temperatura = 0;
    }*/
    
    char hSTR[7];
    char tSTR[7];
    snprintf(hSTR, sizeof(hSTR), "%.0f", humidade);
    snprintf(tSTR, sizeof(tSTR), "%.0f", temperatura);

    int larguraH = strlen(hSTR);
    
    char* retorno = new char[larguraH + strlen(tSTR) + 2];
    retorno[0] = '\0';
    
    strcat(retorno, hSTR);
    retorno[larguraH] = '|';
    retorno[larguraH + 1] = '\0';
    strcat(retorno, tSTR);
    return retorno;
}

DHT11Sensor::DHT11Sensor(int gpio) : Sensor(gpio, "dht11")
{   
    dht = DHT(gpio, DHTTYPE);
    dht.begin();
}
