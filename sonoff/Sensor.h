#ifndef SENSOR_H
#define SENSOR_H

class Sensor 
{
    protected:
        int GPIO;
        std::string nome;   
    public:
        virtual char* executar();
        int getGPIO() const;
        void setGPIO(int);
        std::string getNome() const;
        void setNome(std::string);
        Sensor(int, std::string);
};

#endif