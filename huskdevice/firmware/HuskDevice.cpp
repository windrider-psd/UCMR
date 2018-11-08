#include "HuskDevice.h"
#include "Sensor.h"
#include "SensorFactory.h"
#include "firmware_enum.h"
#include <memory>
#include <stdlib.h>
void HuskDevice::LigarLed()
{
	if (LOGICA_INV_LED == true)
	{
		digitalWrite(LED_PIN, LOW);
	}
	else
	{
		digitalWrite(LED_PIN, HIGH);
	}
}

void HuskDevice::DesligarLed()
{
	if (LOGICA_INV_LED == true)
	{
		digitalWrite(LED_PIN, HIGH);
	}
	else
	{
		digitalWrite(LED_PIN, LOW);
	}
}

void HuskDevice::LigarSonoff()
{
	digitalWrite(OUTPUT_PIN, HIGH);
	SONOFF_LIGADO = 1;
}

void HuskDevice::DesligarSonoff()
{
	digitalWrite(OUTPUT_PIN, LOW);
	SONOFF_LIGADO = 0;
}

void HuskDevice::InscreverTodosTopicos()
{
	int total = topicos.size();
	for (int i = 0; i < total; i++)
	{
		MQTT.subscribe(topicos.at(i));
	}
	MQTT.subscribe(ID_CLIENTE);
}

void HuskDevice::AdicionarTopico(char *topico)
{
	int total = topicos.size();
	if (total <= 5)
	{

		//Primeiro verifica se o tópico já está no vetor
		
		for (int i = 0; i < total; i++)
		{		
			if (strcmp(topicos.at(i), topico) == 0)
			{
				return;
			}
		}
		
		topicos.push_back(topico);
		MQTT.subscribe(topico);
	}
}

void HuskDevice::ImprimirTopicos() const
{
	/*for (Topico *aux = raizTopicos; aux != NULL; aux = aux->proximo)
	{
		Serial.printf("Topico: %s\n", aux->nome);
	}
	Serial.printf("-------------------\n");*/
}

void HuskDevice::RemoverTopico(char *topico)
{
	int total = topicos.size();
	for (int i = 0; i < total; i++)
	{
		if (strcmp(topicos.at(i), topico) == 0)
		{
			delete[] topicos.at(i);
			topicos.erase(topicos.begin() + i);
			break;
		}
	}

}

void HuskDevice::EnviarMensagemLigado()
{
	char *ligado_mensagem = new char[2];
	char *ligado_topico = new char[strlen(ID_CLIENTE) + strlen("/ligado") + 1];

	ligado_topico[0] = '\0';

	strcat(ligado_topico, ID_CLIENTE);
	strcat(ligado_topico, "/ligado");

	itoa(SONOFF_LIGADO, ligado_mensagem, 10);

	MQTT.publish(ligado_topico, ligado_mensagem);
	delete[] ligado_topico;
	delete[] ligado_mensagem;
}


void HuskDevice::EnviarMensagemStatus()
{
	char *status_mensagem = new char[2];
	char *status_topico = new char[strlen(ID_CLIENTE) + strlen("/status") + 1];
	status_topico[0] = '\0';

	strcat(status_topico, ID_CLIENTE);
	strcat(status_topico, "/status");

	status_mensagem[0] = SONOFF_STATUS;
	status_mensagem[1] = '\0';

	MQTT.publish(status_topico, status_mensagem);
	delete[] status_mensagem;
	delete[] status_topico;
}


void HuskDevice::ReconnectMQTT()
{
	if (MQTT.connect(ID_CLIENTE, MQTT_USER, MQTT_PASSWORD))
	{
		InscreverTodosTopicos();
		EnviarMensagemStatus();
		EnviarMensagemLigado();
	}
}

void HuskDevice::ReconnectWiFi() {
	while (!WiFi.isConnected()) {

	}
}

void HuskDevice::mqtt_callback(char* topic, byte* payload, unsigned int length)
{
	char *comando;
	char *chave;
	bool vezValor = false;
	int j = 0;


	for (int i = 0; i < length; i++)
	{
		char c = (char)payload[i];
		if (c == '\n')
		{

			comando = new char[i + 1];
			for (j; j < i; j++)
			{
				comando[j] = (char)payload[j];
			}

			comando[j] = '\0';
			j = 0;

			chave = new char[length - i + 2];
			vezValor = true;
		}
		else if (vezValor == true)
		{
			chave[j] = c;
			j++;
		}

	}

	chave[j] = '\0';
	Serial.printf("Comando: %s\nChave: %s\n", comando, chave);

	if (strcmp(comando, "tp") == 0)
	{
		if (strcmp(chave, "1") == 0)
		{
			LigarSonoff();
			// LigarLed();
		}
		else
		{
			DesligarSonoff();
			//DesligarLed();
		}
	}
	else if (strcmp(comando, "sub") == 0)
	{
		//AdicionarTopico(chave);
		int largura = strlen(chave);
		int index = 0;
		int ultimoindex = 0;
		for (int y = 0; y < largura + 1; y++, index++)
		{
			if (chave[y] == '\r' || chave[y] == '\0')
			{
				char *topico = new char[index + 2]; //+ 1 por causa de posição e + 1 por de \0
				int x;
				int indextmp = 0;
				for (x = ultimoindex; x < y; x++, indextmp++)
				{
					topico[indextmp] = chave[x];
				}
				topico[indextmp] = '\0';
				AdicionarTopico(topico);
				ultimoindex = y + 1; //Para pular o \r
				index = -1;
			}
		}

	}
	else if (strcmp(comando, "unsub") == 0)
	{
		RemoverTopico(chave);
	}
	else if (strcmp(comando, "add_sensor") == 0)
	{
		char *sensor;
		char *gpio;

		bool vezGPIO = false;
		int k = 0;

		int larguraChave = strlen(chave);
		for (int i = 0; i < larguraChave; i++)
		{
			char c = chave[i];
			if (c == '\r')
			{
				sensor = new char[i + 1];
				for (k; k < i; k++)
				{
					sensor[k] = chave[k];
				}

				sensor[k] = '\0';
				k = 0;
				gpio = new char[larguraChave - i + 2];
				vezGPIO = true;
			}
			else if (vezGPIO == true)
			{
				gpio[k] = c;
				k++;
			}
		}
		gpio[k] = '\0';


		int intGpio = std::atoi(gpio);
		std::unique_ptr<Sensor> novoSensor = SensorFactory::CriarSensor(sensor, intGpio);
		AdicionarSensor(std::move(novoSensor));
		delete[] sensor;
		delete[] gpio;
	}
	else if (strcmp(comando, "rem_sensor") == 0)
	{
		int intGPIO = std::atoi(chave);
		RemoverSensor(intGPIO);
	}
	else if (strcmp(comando, "sts") == 0)
	{
		SONOFF_STATUS = chave[0];
	}
	else
	{
		for (int y = 0; y < 5; y++) //Indicação que deu algo de errado
		{
			LigarLed();
			delay(500);
			DesligarLed();
			delay(500);
		}
	}
	delete[] comando;
	delete[] chave;
	Serial.flush();
}




void HuskDevice::CriarID()
{
	String idstr = WiFi.macAddress();
	ID_CLIENTE = new char[idstr.length() + 1];
	idstr.toCharArray(ID_CLIENTE, idstr.length() + 1);
}

HuskDevice::HuskDevice(TipoUpload stipo)
{
	switch (stipo)
	{
		case SONOFF_BASIC: //basic      
			OUTPUT_PIN = 12;
			LED_PIN = 13;
			BTN_PIN = 0;
			LOGICA_INV_LED = true;
			break;
		case SONOFF_POW: //pow
			OUTPUT_PIN = 12;
			LED_PIN = 15;
			BTN_PIN = 0;
			LOGICA_INV_LED = false;
			break;
		case NODE_MCU: //node_mcu
			LOGICA_INV_LED = false;
			break;
		default:
		{
			Serial.printf("Tipo inválido\n");
			return;
		}
	}
	tipo = stipo;
	Iniciar();
}

void HuskDevice::Iniciar()
{
	if (tipo != NODE_MCU)
	{
		pinMode(OUTPUT_PIN, OUTPUT);
		pinMode(LED_PIN, OUTPUT);
		pinMode(BTN_PIN, INPUT);
	}
	
	CriarID();
	SONOFF_STATUS = '0';
	MQTT = PubSubClient(espClient);

}



void HuskDevice::VerificarBtn()
{
	int btn_estado_atual = digitalRead(BTN_PIN);

	if (btn_estado_atual == 0 && btn_estado_atual != BTN_ESTADO)
	{
		if (SONOFF_LIGADO == 0)
		{
			LigarSonoff();
		}
		else
		{
			DesligarSonoff();
		}
		if (MQTT.connected())
		{
			EnviarMensagemLigado();
		}

	}
	BTN_ESTADO = btn_estado_atual;
}


void HuskDevice::Conectar(const char *ssid, const char *senha, const char *servidor, int porta, const char *usuariomqtt, const char *senhamqtt)
{

	WiFi.begin(ssid, senha);

	static unsigned long ultimo = millis();
	bool ligar = true;
	int intervaloLed = 150;
	while(!WiFi.isConnected())
	{
		if (tipo != NODE_MCU) //Se não é node_mcu
		{
			VerificarBtn();
			if ((millis() - ultimo) > intervaloLed)
			{

				ultimo = millis();
				if (ligar == true)
				{
					LigarLed();
					ligar = false;
				}
			}
			else
			{
				DesligarLed();
				ligar = true;
			}
			
		}
		delay(50); //Sem o delay o sonoff crasha
	}
	Serial.printf("Conectado\n");
	DesligarLed();

	MQTT_USER = new char[strlen(usuariomqtt) + 1];
	MQTT_USER[0] = '\0';
	strcpy(MQTT_USER, usuariomqtt);


	MQTT_PASSWORD = new char[strlen(senhamqtt) + 1];
	MQTT_PASSWORD[0] = '\0';
	strcpy(MQTT_PASSWORD, senhamqtt);

	Serial.printf("Usuario: %s\nSenha: %s\n", MQTT_USER, MQTT_PASSWORD);

	// DesligarLed();
	MQTT.setServer(servidor, porta); //Endereço de ip e porta do broker MQTT
	MQTT.setCallback(std::bind(&HuskDevice::mqtt_callback, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
}

void HuskDevice::Loop()
{
	if (tipo != NODE_MCU)
	{
		VerificarBtn();
	}

	if (!MQTT.connected()) {
		ReconnectMQTT();
	}
	else
	{
		int total = sensores.size();
		for (int i = 0; i < total; i++)
		{
			Sensor *p = sensores.at(i).get();
			if ((millis() - p->ultimoIntervalo) > p->intervalo)
			{
				p->ultimoIntervalo = millis();
				char* valorSensor = p->executar();
				char *topico = new char[strlen(ID_CLIENTE) + strlen(p->getNome()) + 2];
				topico[0] = '\0';
				strcat(topico, ID_CLIENTE);
				strcat(topico, "/");
				strcat(topico, p->getNome());
				Serial.printf("topico: %s\nmensagem:%s\n-------\n", topico, valorSensor);
				MQTT.publish(topico, valorSensor);
				delete[] topico;
				delete[] valorSensor;
			}
		}
		MQTT.loop();
	}


}

void HuskDevice::AdicionarSensor(std::unique_ptr<Sensor> s)
{
	sensores.push_back(std::move(s));
}

void HuskDevice::RemoverSensor(int gpio)
{
	int tamanho = sensores.size();
	for (int i = 0; i < tamanho; i++)
	{
		std::unique_ptr<Sensor> &sensorUnique = sensores.at(i);
		Sensor *sensor = sensorUnique.get();

		bool remover = sensor->getGPIO() == gpio;
		if (remover)
		{
			sensorUnique.release();
			sensores.erase(sensores.begin() + i);
			break;
		}
	}
}

int HuskDevice::GetBtn() const { return BTN_PIN; }
int HuskDevice::GetLed() const { return LED_PIN; }
PubSubClient HuskDevice::GetMQTT() const { return MQTT; }
int HuskDevice::GetOutput() const { return OUTPUT_PIN; }
char HuskDevice::GetStatus() const { return SONOFF_STATUS; }
char* HuskDevice::GetID() const { return ID_CLIENTE; }
