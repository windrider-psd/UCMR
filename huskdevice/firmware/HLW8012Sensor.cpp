#include "HLW8012Sensor.h"
#include <Arduino.h>
#define CURRENT_MODE HIGH
#define CURRENT_RESISTOR 0.001
#define VOLTAGE_RESISTOR_UPSTREAM (5 * 470000)
#define VOLTAGE_RESISTOR_DOWNSTREAM ( 1000 )


void HLW8012Sensor::unblockingDelay(unsigned long mseconds) {
	unsigned long timeout = millis();
	while ((millis() - timeout) < mseconds) delay(1);
}

void HLW8012Sensor::calibrate() {

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



char* HLW8012Sensor::executar()
{
	double corrente = hlw8012.getCurrent();
	int tensao = hlw8012.getVoltage();
	int potencia = hlw8012.getActivePower();

	char *mensagemCorrente = new char[50];
	sprintf(mensagemCorrente, "%13.5f", corrente);

	char *mensagemTensao = new char[5];
	itoa(tensao, mensagemTensao, 10);

	char *mensagemPotencia = new char[20];
	itoa(potencia, mensagemPotencia, 10);

	int larguraCorrente = strlen(mensagemCorrente);
	int larguraTensao = strlen(mensagemTensao);
	char* mensagemCompleta = new char[larguraCorrente + larguraTensao + strlen(mensagemPotencia) + 3];
	mensagemCompleta[0] = '\0';
	strcat(mensagemCompleta, mensagemCorrente);
	mensagemCompleta[larguraCorrente] = '\n';
	mensagemCompleta[larguraCorrente + 1] = '\0';
	strcat(mensagemCompleta, mensagemTensao);
	mensagemCompleta[larguraTensao] = '\n';
	mensagemCompleta[larguraTensao + 1] = '\0';
	strcat(mensagemCompleta, mensagemPotencia);

	delete[] mensagemTensao;
	delete[] mensagemCorrente;
	delete[] mensagemPotencia;

	return mensagemCompleta;
}




HLW8012Sensor::HLW8012Sensor(int gpio) : Sensor(gpio, "ldr")
{
	// pinMode(gpio, OUTPUT);
	hlw8012.begin(CF_PIN, CF1_PIN, SEL_PIN, CURRENT_MODE, false, 500000);
	hlw8012.setResistors(CURRENT_RESISTOR, VOLTAGE_RESISTOR_UPSTREAM, VOLTAGE_RESISTOR_DOWNSTREAM);
	intervalo = 30000;
}
