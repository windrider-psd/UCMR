#include "Sensor.h"

#ifndef LDR_H
#define LDR_H

class LDR : public Sensor {

    public:
        char* executar();
        LDR(int);
};


#endif
