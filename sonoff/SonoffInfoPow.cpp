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

void SonoffInfoPow::LoopSensor()
{
  static unsigned long last = millis();

  if ((millis() - last) > intervalo) {

      last = millis();
      Serial.print("[HLW] Active Power (W)    : "); Serial.println(hlw8012.getActivePower());
      Serial.print("[HLW] Voltage (V)         : "); Serial.println(hlw8012.getVoltage());
      Serial.print("[HLW] Current (A)         : "); Serial.println(hlw8012.getCurrent());
      Serial.print("[HLW] Apparent Power (VA) : "); Serial.println(hlw8012.getApparentPower());
      Serial.print("[HLW] Power Factor (%)    : "); Serial.println((int) (100 * hlw8012.getPowerFactor()));
      Serial.println();

      hlw8012.toggleMode();

  }
}


SonoffInfoPow::SonoffInfoPow(int inter) : SonoffInfo(1)
{
  intervalo = inter;
}
