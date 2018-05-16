#include <PubSubClient.h>
#include <ESP8266WiFi.h>

int LED_SONOFF = 13;
char *ID_CLIENTE;

typedef struct topico
{
  char *nome;
  struct topico *proximo;
}Topico;


Topico *raizTopicos;
int totalTopicos = 0;

WiFiClient espClient;
PubSubClient MQTT(espClient);

void InscreverTodosTopicos()
{
  for(Topico *aux = raizTopicos; aux != NULL; aux = aux->proximo)
  {
    MQTT.subscribe(aux->nome);
  }
  MQTT.subscribe(ID_CLIENTE);
}

void AdicionarTopico(char *topico)
{
  if(totalTopicos <= 5)
  {
    Topico *novoTopico = new Topico;
    novoTopico->nome = new char[strlen(topico) + 1];
    strcpy(novoTopico->nome, topico);
    
    novoTopico->proximo = raizTopicos;
    raizTopicos = novoTopico;
    totalTopicos++;
    MQTT.subscribe(topico);
  }
}

void RemoverTopico(char *topico)
{
  Topico *auxAtual = raizTopicos;
  Topico *auxAnterior = NULL;

  for(;auxAtual != NULL; auxAtual = auxAtual->proximo, auxAnterior = auxAtual)
  { 
    if(strcmp(auxAtual->nome, topico) == 0)
    {
      totalTopicos--;
      MQTT.unsubscribe(auxAtual->nome);
      break;
    }
  }

  if(auxAnterior == NULL)
  {
    raizTopicos = raizTopicos->proximo;
    delete[] auxAtual->nome;
    delete auxAtual;
    
  }
  else if(auxAtual != NULL)
  {
    auxAnterior = auxAtual->proximo;
    delete[] auxAtual->nome;
    delete auxAtual;
  }
  
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) 
{
  char *comando;
  char *chave;
  bool vezValor = false;
  int j = 0;
 
  
  for(int i = 0; i < length; i++)
  {
    char c = (char)payload[i];
    if(c == '\n')
    {
      //comando = (char*)malloc((i * sizeof(char)) + 1);
      comando = new char[i + 1];
      for(j; j < i; j++)
      {
        comando[j] = (char)payload[j];
        
      }
   
      comando[j] = '\0';
      j = 0;
      //chave = (char*)malloc(((length - (i + 1)) * sizeof(char)) + 1);
      chave = new char[length - i + 2];
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
    AdicionarTopico(chave);
    char *tmptopico;
    int largura = strlen(chave);
    int index = 0;
    Serial.printf("%s\n", chave);
    for(int y = 0; y < largura; y++, index++)
    {
      Serial.printf("y: %d index: %d\n", y, index);
      if(chave[y] == '\r')
      {
        tmptopico = new char[index + 1];
          int x;
          for(x = 0; x < index; x++)
          {
            tmptopico[x] = chave[x];
          }
          tmptopico[x] = '\0';
        char* topico = new char[index + 1];
        strcpy(topico, tmptopico);
        Serial.printf("%s\n", topico);
        AdicionarTopico(topico);
        delete[] tmptopico;
        index = -1;
      }
    }
    Serial.printf("sobrou: %s\n", tmptopico);
  }
  else if(strcmp(comando,"unsub") == 0)
  {
    RemoverTopico(chave);
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
  delete[] comando;
  delete[] chave;
  
  Serial.flush();
}

void CriarID()
{ 

    String idstr = WiFi.macAddress();
    ID_CLIENTE = new char[idstr.length() + 1];
    idstr.toCharArray(ID_CLIENTE,  idstr.length() + 1);
     
}

void reconnectMQTT() {

  while (!MQTT.connected()) {
    
    if (MQTT.connect(ID_CLIENTE)) {
      MQTT.subscribe(ID_CLIENTE);
      InscreverTodosTopicos();
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
  
  WiFi.begin("dlink", NULL); //nome e senha da wifi. NULL para a senha se a wifi for aberta.

  //precisa de um loop para se conectar já que demora um tempinho
  while (WiFi.status() != WL_CONNECTED) 
  {
    digitalWrite(LED_SONOFF, LOW); 
    delay(100);
    digitalWrite(LED_SONOFF, HIGH);
    delay(100);
  }
  MQTT.setServer("200.132.36.147", 1883); //Endereço de ip e porta do broker MQTT
  MQTT.setCallback(mqtt_callback);
  CriarID();
  raizTopicos = NULL;
}

void loop() 
{
  if (!MQTT.connected()) {
    reconnectMQTT();
  }
  
  recconectWiFi();
  MQTT.loop();
}

