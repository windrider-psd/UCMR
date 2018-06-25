#include "HLW8012.H"

#define CURRENT_MODE HIGH
#define CURRENT_RESISTOR 0.001

#ifndef SONOFFINFOPOW_H
#define SONOFFINFOPOW_H

class SonoffInfoPow: public SonoffInfo
{
  private:
    static int const SEL_PIN = 5;
    static int const CF1_PIN = 13;
    static int const CF_PIN = 14;
    static int const VOLTAGE_RESISTOR_UPSTREAM = (5 * 470000);
    static int const VOLTAGE_RESISTOR_DOWNSTREAM = ( 1000 );
    
    int intervalo;
    HLW8012 hlw8012;
    
  public:
    SonoffInfoPow(int);
    void calibrate();
    void unblockingDelay(unsigned long);
    void IniciarSensor();
    int GetIntervalo() const;
    void SetIntervalo(int);
    void LoopSensor();
};

#endif
