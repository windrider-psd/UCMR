#include "Sensor.h"

#ifndef PIR_H
#define PIR_H

class PIR : public Sensor {

    public:
        virtual char* executar();
        PIR(int);
};


#endif
