#ifndef SENSOR_H
#define SENSOR_H
#include <string>
#include <arduino.h>
  class Sensor 
{
    protected:
        int GPIO;
        char* nome;   
    public:
        virtual char* executar() = 0;
        int getGPIO() const;
        void setGPIO(int);
        char* getNome() const;
        void setNome(char*);
        explicit Sensor(int, char*);
        bool operator == (const Sensor &outro) const
        {
          return this->getGPIO() == outro.getGPIO();
        }
};

#endif
