#include <PubSubClient.h>
#include <ESP8266WiFi.h>

int LED_SONOFF = 13;
char ID_CLIENTE[23];
WiFiClient espClient;
PubSubClient MQTT(espClient);


void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  
  /*
   * Tentativa de tentar fazer mais correto
   * char *comando;
  char *chave; 
  int j = 0;
  bool vezcomando = true;
  //lê payload
  for(int i = 0; i < length; i++)
  {
    char c = (char)payload[i]; //Transforma os bytes em char
    
    if(c == '\n')
    {
      vezcomando = false;
      
      for(int x = 0; x < j; x++)
      {
        Serial.printf("char: %c\n", comando[x]);
      }
     
      j = 0;
    }
    else
    {
      if(vezcomando == true)
      {
        comando = (char*)malloc(sizeof(char));
        append(comando, c);
        
      }
      else
      {
        chave = (char*)malloc(sizeof(char));
        append(chave, c);
      }
      
      j++;
    }
  }
  
  //chave = (char*)malloc(sizeof(char));
 // chave[j] = '\0';
  if(strcmp(comando, "tp"))
  {
    
    if(strcmp(chave, "1"))
    {
      digitalWrite(LED_SONOFF, LOW);
    }
    else
    {
      digitalWrite(LED_SONOFF, HIGH);
    }
  }
  else if(strcmp(comando,"sub"))
  {
    MQTT.subscribe(chave);
  }
  else if(strcmp(comando,"unsub"))
  {
    MQTT.unsubscribe(chave);
  }
  else
  {
    while(true) //Indicação que deu algo de errado
    {
      digitalWrite(LED_SONOFF, LOW); // LOW will turn on the LED
      delay(500);
      digitalWrite(LED_SONOFF, HIGH);
      delay(500);
    }
  }*/
  
  String message;
  for (int i = 0; i < length; i++) {
    char c = (char)payload[i];
    message += c;
  }


  
  
  String comando;
  String valor;
  for(int i=0; i<message.length(); i++) {
    char letra = message.charAt(i);
    if(letra == '\n')
    {
      comando = valor;
      valor = "";
    }
    else
    {
      valor+=letra;
    }
  }
  
    if(comando == "tp")
    {
      if(valor == "1")
      {
        digitalWrite(LED_SONOFF, LOW);
      }
      else
      {
        digitalWrite(LED_SONOFF, HIGH);
      }
    }
    else if(comando == "sub")
    {
      int tam = valor.length() + 1;
      char buf[tam];
      
      valor.toCharArray(buf, tam);
      MQTT.subscribe(buf);
    }
    else if(comando == "unsub")
    {
      int tam = valor.length() + 1;
      char buf[tam];
      valor.toCharArray(buf, tam);
      MQTT.unsubscribe(buf);
    }
    else
    {
      while(true)
      {
        digitalWrite(LED_SONOFF, LOW); // LOW will turn on the LED
        delay(500);
        digitalWrite(LED_SONOFF, HIGH);
        delay(500);
      }
      
    }
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
  
  WiFi.begin("nomewifi", "senhawifi"); //nome e senha da wifi

  //precisa de um loop para se conectar já que demora um tempinho
  while (WiFi.status() != WL_CONNECTED) 
  {
    digitalWrite(LED_SONOFF, LOW); 
    delay(250);
    digitalWrite(LED_SONOFF, HIGH);
    delay(250);
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

