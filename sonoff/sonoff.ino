  /*
  Configurações de upload:
  Placa: Generic ESP8266 module
  Flash Mode : DOUT
  Flash Size: 1 MB
  Reset Mode: CK
  Crystal Frequency: 24 Mhz
  Flash Frequency: 40 Mhz
  CPU Frequency: 80 Mhz
  Upload Speed: 115200
*/


#include "SonoffInfo.h"
#include "SonoffInfoPow.h"
#include "SonoffTipos.h"
#include "Sensor.h"
#include "pir.h"
//#define TIPO SONOFF_BASIC
//#define TIPO SONOFF_POW
#define TIPO NODE_MCU

#if TIPO == SONOFF_BASIC
  SonoffInfo sinfo(0); 

#elif TIPO == NODE_MCU
  SonoffInfo sinfo(2); 

#elif TIPO == SONOFF_POW
  SonoffInfoPow sinfo(30000); //tempo de atualização do sensor
#endif

void setup()
{
  Serial.begin(115200);
  delay(2000);
  
  sinfo.Iniciar();
  
  #if TIPO == SONOFF_POW
    sinfo.IniciarSensor();
  #endif
  
  sinfo.Conectar("LAB207", "poli@lab207#", "200.132.36.147", 1883, "usuario", "senha"); //ssid, senha, broker, porta, mqttusuario, mqttsenha
  Serial.println("Conectado");
}

void loop() 
{
  sinfo.Loop();
  
  #if TIPO == SONOFF_POW
    sinfo.LoopSensor(); 
  #endif
}
