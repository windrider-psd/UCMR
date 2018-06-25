#include "SonoffInfo.h"
#include "SonoffInfoPow.h"
#include "SonoffTipos.h"

#define TIPO SONOFF_BASIC

#if TIPO == SONOFF_BASIC
  SonoffInfo sinfo(0);

#elif TIPO == SONOFF_POW
  SonoffInfoPow sinfo(2000);
#endif

void setup()
{
  Serial.begin(115200);
  sinfo.Iniciar();
  
  #if TIPO == SONOFF_POW
    sinfo.IniciarSensor();
  #endif
  
  sinfo.Conectar("dlink", NULL, "200.132.36.147", 1883); //ssid, senha, broker, porta
}

void loop() 
{
  sinfo.Loop();

  #if TIPO == SONOFF_POW
    sinfo.LoopSensor();
  #endif
}
