#ifndef SENSOR_H
#define SENSOR_H
#include <string>
class Sensor 
{
    protected:
        int GPIO;
        char* nome;   
    public:
        virtual char* executar(){};
        int getGPIO() const;
        void setGPIO(int);
        char* getNome() const;
        void setNome(char*);
        Sensor(int, char*);
        bool operator == (const Sensor &outro) const
        {
          return this->getGPIO() == outro.getGPIO();
        }
};

#endif
