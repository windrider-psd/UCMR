#include "Sensor.h"

#ifndef LDR_H
#define LDR_H

class LDR : Sensor {

    public:
        char* executar();
        LDR(int);
};


#endif