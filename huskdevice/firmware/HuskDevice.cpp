#include "HuskDevice.h"
#include "Sensor.h"
#include "SensorFactory.h"
void HuskDevice::LigarLed()
{
	if (tipo != NODE_MCU)
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
	
}

void HuskDevice::DesligarLed()
{
	if (tipo != NODE_MCU)
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
	
}

void HuskDevice::LigarSonoff()
{
	if (tipo != NODE_MCU)
	{
		digitalWrite(OUTPUT_PIN, HIGH);
		SONOFF_LIGADO = 1;
	}
	
}

void HuskDevice::DesligarSonoff()
{
	if (tipo != NODE_MCU)
	{
		digitalWrite(OUTPUT_PIN, LOW);
		SONOFF_LIGADO = 0;
	}
	
}

void HuskDevice::InscreverTodosTopicos()
{
	int total = topicos.size();
	for (int i = 0; i < total; i++)
	{
		MQTT.subscribe(topicos.at(i).c_str());
	}
	MQTT.subscribe(ID_CLIENTE);
}

void HuskDevice::AdicionarTopico(std::string topico)
{
	int total = topicos.size();
	if (total <= 5)
	{

		//Primeiro verifica se o tópico já está no vetor
		
		for (int i = 0; i < total; i++)
		{		
			if (topicos.at(i) == topico)
			{
				return;
			}
		}
		
		topicos.push_back(topico);
		MQTT.subscribe(topico.c_str());
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

void HuskDevice::RemoverTopico(std::string topico)
{
	int total = topicos.size();
	for (int i = 0; i < total; i++)
	{
		if (topicos.at(i) == topico)
		{
			topicos.erase(topicos.begin() + i);
			break;
		}
	}

}

void HuskDevice::EnviarMensagemLigado()
{
	std::string topico;
	char mensagem[2];

	itoa(SONOFF_LIGADO, mensagem, 10);

	topico.append(this->ID_CLIENTE);
	topico.append("/ligado");

	MQTT.publish(topico.c_str(), mensagem);
}


void HuskDevice::EnviarMensagemStatus()
{
	std::string topico;
	std::string mensagem;
	mensagem += this->SONOFF_STATUS;

	topico.append(this->ID_CLIENTE);
	topico.append("/status");

	MQTT.publish(topico.c_str(), mensagem.c_str());
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
	std::string comando;
	std::string chave;

	bool vezChave = false;


	for (int i = 0; i < length; i++)
	{
		char c = (char)payload[i];
		if (c == '\n')
		{
			for (int j = 0; j < i; j++)
			{
				comando += (char)payload[j];
			}

			vezChave = true;
		}
		else if (vezChave == true)
		{
			chave += c;
		}

	}

	Serial.printf("Comando: %s\nChave: %s\n", comando.c_str(), chave.c_str());

	if (comando == "tp")
	{
		chave == "1" ? LigarSonoff() : DesligarSonoff();
	}
	else if (comando == "sub")
	{
		int largura = chave.length();
		int index = 0;
		int ultimoindex = 0;
		for (int y = 0; y < largura + 1; y++, index++)
		{
			if (chave[y] == '\r' || chave[y] == '\0')
			{
				std::string topico;
				
				int x;
				int indextmp = 0;
				for (x = ultimoindex; x < y; x++, indextmp++)
				{
					topico += chave[x];
				}
				

				AdicionarTopico(topico);

				ultimoindex = y + 1; //Para pular o \r
				index = -1;
			}
		}

	}
	else if (comando == "unsub")
	{
		RemoverTopico(chave);
	}
	else if (comando == "add_sensor")
	{
		std::string sensor;
		std::string gpio;

		bool vezGPIO = false;
		int k = 0;

		int larguraChave = chave.length();
		for (int i = 0; i < larguraChave; i++)
		{
			char c = chave[i];
			if (c == '\r')
			{
				for (k; k < i; k++)
				{
					sensor += chave[k];
				}

				k = 0;
				vezGPIO = true;
			}
			else if (vezGPIO == true)
			{
				gpio += c;
				k++;
			}
		}
		
		Serial.printf("Sensor: %s\GPIO: %s\n", sensor.c_str(), gpio.c_str());

		int intGpio = std::atoi(gpio.c_str());
		std::unique_ptr<Sensor> novoSensor = SensorFactory::CriarSensor(sensor, intGpio);
		AdicionarSensor(std::move(novoSensor));
	}
	else if (comando == "rem_sensor")
	{
		int intGPIO = std::atoi(chave.c_str());
		RemoverSensor(intGPIO);
	}
	else if (comando == "sts")
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

				std::vector<MensagemMqtt> mensagens = p->executar();
				std::string topicoBase(this->ID_CLIENTE);

				for (std::vector<MensagemMqtt>::iterator iterador = mensagens.begin(); iterador != mensagens.end(); ++iterador)
				{
					std::string topico = topicoBase + "/" + iterador->topico;
					//Serial.printf("Topico: %s\n", topico.c_str());
					//Serial.printf("Mensagem: %s\n", iterador->payload.c_str());
					
					MQTT.publish(topico.c_str(), iterador->payload.c_str());
				}
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
