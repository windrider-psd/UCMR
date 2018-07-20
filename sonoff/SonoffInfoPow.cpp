#include "SonoffInfo.h"
#include "SonoffInfoPow.h"


using namespace std;



int SonoffInfoPow::GetIntervalo() const
{
  return intervalo;
}

void SonoffInfoPow::SetIntervalo(int novointervalo)
{
  intervalo = novointervalo;
}


void SonoffInfoPow::unblockingDelay(unsigned long mseconds) {
    unsigned long timeout = millis();
    while ((millis() - timeout) < mseconds) delay(1);
}

void SonoffInfoPow::calibrate() {

    // Let's first read power, current and voltage
    // with an interval in between to allow the signal to stabilise:

    hlw8012.getActivePower();

    hlw8012.setMode(MODE_CURRENT);
    unblockingDelay(2000);
    hlw8012.getCurrent();

    hlw8012.setMode(MODE_VOLTAGE);
    unblockingDelay(2000);
    hlw8012.getVoltage();

    // Calibrate using a 60W bulb (pure resistive) on a 230V line
    hlw8012.expectedActivePower(60.0);
    hlw8012.expectedVoltage(230.0);
    hlw8012.expectedCurrent(60.0 / 230.0);

    // Show corrected factors
    Serial.print("[HLW] New current multiplier : "); Serial.println(hlw8012.getCurrentMultiplier());
    Serial.print("[HLW] New voltage multiplier : "); Serial.println(hlw8012.getVoltageMultiplier());
    Serial.print("[HLW] New power multiplier   : "); Serial.println(hlw8012.getPowerMultiplier());
    Serial.println();

}

void SonoffInfoPow::IniciarSensor()
{
   //digitalWrite(RELAY_PIN, HIGH);
    hlw8012.begin(CF_PIN, CF1_PIN, SEL_PIN, CURRENT_MODE, false, 500000);
    hlw8012.setResistors(CURRENT_RESISTOR, VOLTAGE_RESISTOR_UPSTREAM, VOLTAGE_RESISTOR_DOWNSTREAM);   
}


void SonoffInfoPow::EnviarHLW()
{
  double corrente = hlw8012.getCurrent();
  int tensao = hlw8012.getVoltage();
  int potencia = hlw8012.getActivePower();
  
  char *topicoCorrente = new char[strlen(ID_CLIENTE) + strlen("/corrente") + 1];
  char *topicoTensao = new char[strlen(ID_CLIENTE) + strlen("/tensao") + 1];
  char *topicoPotencia = new char[strlen(ID_CLIENTE) + strlen("/potencia") + 1];

  topicoPotencia[0] = '\0';
  topicoCorrente[0] = '\0';
  topicoTensao[0] = '\0';

  strcat(topicoCorrente, ID_CLIENTE);
  strcat(topicoCorrente, "/corrente");
  strcat(topicoTensao, ID_CLIENTE);
  strcat(topicoTensao, "/tensao");
  strcat(topicoPotencia, ID_CLIENTE);
  strcat(topicoPotencia, "/potencia");

  char *mensagemCorrente = new char[50];
  sprintf(mensagemCorrente,"%13.5f",corrente);

  char *mensagemTensao = new char[5];
  itoa(tensao, mensagemTensao, 10);

  char *mensagemPotencia = new char[20];
  itoa(potencia, mensagemPotencia, 10);

  MQTT.publish(topicoCorrente, mensagemCorrente);
  MQTT.publish(topicoTensao, mensagemTensao);
  MQTT.publish(topicoPotencia, mensagemPotencia);

  delete[] mensagemTensao;
  delete[] mensagemCorrente;
  delete[] mensagemPotencia;
  delete[] topicoPotencia;
  delete[] topicoCorrente;
  delete[] topicoTensao;
}

void SonoffInfoPow::LoopSensor()
{
  static unsigned long last = millis();
  
  if ((millis() - last) > intervalo) {
      last = millis();
      /*Serial.print("[HLW] Active Power (W)    : "); Serial.println(hlw8012.getActivePower());
      Serial.print("[HLW] Voltage (V)         : "); Serial.println(hlw8012.getVoltage());
      Serial.print("[HLW] Current (A)         : "); Serial.println(hlw8012.getCurrent());
      Serial.print("[HLW] Apparent Power (VA) : "); Serial.println(hlw8012.getApparentPower());
      Serial.print("[HLW] Power Factor (%)    : "); Serial.println((int) (100 * hlw8012.getPowerFactor()));
      Serial.println();*/

      EnviarHLW();
      hlw8012.toggleMode();

  }
}


SonoffInfoPow::SonoffInfoPow(int inter) : SonoffInfo(1)
{
  intervalo = inter;
}
