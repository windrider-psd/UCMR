#include "Sensor.h"
#include "DHT.h"
#ifndef DHT11SENSOR_H
#define DHT11SENSOR_H


class DHT11Sensor : public Sensor {
    private:
        DHT dht;
    public:
        virtual char* executar();
        DHT11Sensor(int);
};


#endif
