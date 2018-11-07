#include "Sensor.h"

#ifndef LDR_H
#define LDR_H

class LDR : public Sensor {

    public:
        virtual char* executar();
        LDR(int);
};


#endif
