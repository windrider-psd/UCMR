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


#include "HuskDevice.h"
#include "Sensor.h"
#include "firmware_enum.h"
#include "SensorFactory.h"
#include "patch.h"
#include <memory>

TipoUpload tipo = NODE_MCU;
//TipoUpload tipo = SONOFF_BASIC
//TipoUpload tipo = SONOFF_POW

std::unique_ptr<HuskDevice> dispositivo;

void setup()
{
	Serial.begin(115200);
	delay(2000);

	dispositivo = std::unique_ptr<HuskDevice>(patch::make_unique<HuskDevice>(tipo));
	HuskDevice* pointerHuskerDevice = dispositivo.get();
	
	pointerHuskerDevice->Conectar("LAB207", "poli@lab207#", "200.132.36.147", 1883, "usuario", "senha"); //ssid, senha, broker, porta, mqttusuario, mqttsenha
	Serial.println("Conectado");

	if (tipo == SONOFF_POW)
	{
		std::unique_ptr<Sensor> shlw = SensorFactory::CriarSensor("hlw8012", 5); //O 5 não importa. 
		pointerHuskerDevice->AdicionarSensor(std::move(shlw));
	}
}

void loop()
{
	dispositivo.get()->Loop();
}
