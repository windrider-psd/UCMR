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
    
    if(isnan(humidade) )
    {
      h = 0;
    }
    if(isnan(temperatura))
    {
      t = 0;
    }
    
    char hSTR[30];
    char tSTR[30];
    sprintf(hSTR, "%.2f", humidade);
    sprintf(tSTR, "%.2f", temperatura);
    int larguraH = strlen(hSTR);
    char* retorno = new char[larguraH + strlen(tSTR) + 2];
    retorno[0] = '\0';

    strcat(retorno, hSTR);
    retorno[larguraH] = '|';
    strcat(retorno, tSTR);
    return retorno;
}

DHT11Sensor::DHT11Sensor(int gpio) : Sensor(gpio, "dht11")
{   
    dht = DHT(gpio, DHTTYPE);
    dht.begin();
}
