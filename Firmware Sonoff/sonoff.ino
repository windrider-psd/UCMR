#include <PubSubClient.h>
#include <ESP8266WiFi.h>

int LED_SONOFF = 13;
char ID_CLIENTE[23];

WiFiClient espClient;
PubSubClient MQTT(espClient);

void mqtt_callback(char* topic, byte* payload, unsigned int length) {

  char *comando;
  char *chave;
  bool vezValor = false;
  int j = 0;
  for(int i = 0; i < length; i++)
  {
    char c = (char)payload[i];
    if(c == '\n')
    {
      comando = (char*)malloc((i * sizeof(char)) + 1);
      for(j; j < i; j++)
      {
        comando[j] = (char)payload[j];
        
      }
   
      comando[j] = '\0';
      j = 0;
      chave = (char*)malloc(((length - (i + 1)) * sizeof(char)) + 1);
      vezValor = true;     
    }
    else if(vezValor == true)
    {
      chave[j] = c;
      j++;
    }
    
  }

  chave[j] = '\0';

  if(strcmp(comando, "tp") == 0)
  {
    if(strcmp(chave, "1") == 0)
    {
      digitalWrite(LED_SONOFF, LOW);
    }
    else
    {
      digitalWrite(LED_SONOFF, HIGH);
    }
  }
  else if(strcmp(comando,"sub") == 0)
  {
    MQTT.subscribe(chave);
  }
  else if(strcmp(comando,"unsub") == 0)
  {
    MQTT.unsubscribe(chave);
  }
  else
  {
    for(int y = 0; y < 5; y++) //Indicação que deu algo de errado
    {
      digitalWrite(LED_SONOFF, LOW);
      delay(500);
      digitalWrite(LED_SONOFF, HIGH);
      delay(500);
    }
  }
  free(comando);
  free(chave);
  Serial.flush();
}

void CriarID()
{
    
     for(int i =0; i < 23; i++)
     {
      byte randomValue = random(0, 36);
      char letter = randomValue + 'a';
        if(randomValue > 26)
         letter = (randomValue - 26) + '0';
       ID_CLIENTE[i] = letter;
     }
     
}

void reconnectMQTT() {
  while (!MQTT.connected()) {
    
    if (MQTT.connect(ID_CLIENTE)) {
      MQTT.subscribe(ID_CLIENTE);

    } else {
      delay(2000);
    }
  }
}

void recconectWiFi() {
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
  }
}

void setup()
{
  pinMode(LED_SONOFF, OUTPUT);
  Serial.begin(115200);
  
  WiFi.begin("ssid", "senha"); //nome e senha da wifi

  //precisa de um loop para se conectar já que demora um tempinho
  while (WiFi.status() != WL_CONNECTED) 
  {
    digitalWrite(LED_SONOFF, LOW); 
    delay(100);
    digitalWrite(LED_SONOFF, HIGH);
    delay(100);
  }
  MQTT.setServer("xxx.xxx.xxx.xxx", 1883); //Endereço de ip e porta do broker MQTT
  MQTT.setCallback(mqtt_callback);
  CriarID();
}

void loop() 
{
  if (!MQTT.connected()) {
    reconnectMQTT();
  }
  
  recconectWiFi();
  MQTT.loop();
}
