#include "Sensor.h"

#ifndef MICROONDAS_H
#define MICROONDAS_h

class Microondas : public Sensor {

    public:
        virtual char* executar();
        Microondas(int);
};


#endif
