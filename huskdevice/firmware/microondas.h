#pragma once
#include "Sensor.h"
class Microondas : public Sensor {

public:
	virtual char* executar();
	Microondas(int);
};


