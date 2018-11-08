#include "Sensor.h"
#pragma once
class PIR : public Sensor {

public:
	virtual char* executar();
	PIR(int);
};

