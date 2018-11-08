#include "Sensor.h"
#include "DHT.h"

#pragma once
class DHT11Sensor : public Sensor {
private:
	DHT dht;
public:
	virtual char* executar();
	DHT11Sensor(int);
};
