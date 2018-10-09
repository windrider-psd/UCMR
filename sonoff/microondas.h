#include "Sensor.h"

#ifndef MICROONDAS_H
#define MICROONDAS_h

class Microondas : Sensor {

    public:
        char* executar();
        Microondas(int);
};


#endif