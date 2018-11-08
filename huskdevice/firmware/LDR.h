#pragma once
#include "Sensor.h"
class LDR : public Sensor {

public:
	virtual char* executar();
	LDR(int);
};

