#include <PubSubClient.h>
#include <ESP8266WiFi.h>

int OUT_SONOFF = 12;
int LED_SONOFF = 13;
char *ID_CLIENTE;
char SONOFF_STATUS = '0';

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
  Topico *aux = raizTopicos;
  if(aux != NULL)
  {
      for(; aux != NULL; aux = aux->proximo)
      {
        MQTT.subscribe(aux->nome);
      }
  }

  MQTT.subscribe(ID_CLIENTE);
}

void AdicionarTopico(char *topico)
{
  if(totalTopicos <= 5)
  {
    //Primeiro verifica se o tópico já está na lista
    for(Topico *auxAtual = raizTopicos;auxAtual != NULL; auxAtual = auxAtual->proximo)
    { 
      if(strcmp(auxAtual->nome, topico) == 0)
      {
        return;
      }
    }

    
    Topico *novoTopico = new Topico;
    novoTopico->nome = new char[strlen(topico) + 1];
    strcpy(novoTopico->nome, topico);
    novoTopico->proximo = raizTopicos;
    raizTopicos = novoTopico;
    totalTopicos++;
    MQTT.subscribe(topico);
    delete[] topico;
  }
}

void ImprimirTopicos()
{
  for(Topico *aux = raizTopicos; aux != NULL; aux = aux->proximo)
  {
    Serial.printf("Topico: %s\n", aux->nome);
  }
  Serial.printf("-------------------\n");
}

void RemoverTopico(char *topico)
{
  Topico *auxAtual;
  Topico *auxAnterior = NULL;

  for(auxAtual = raizTopicos; auxAtual != NULL; auxAnterior = auxAtual, auxAtual = auxAtual->proximo)
  { 
    if(strcmp(auxAtual->nome, topico) == 0)
    {
      totalTopicos--;
      MQTT.unsubscribe(auxAtual->nome);
      if(auxAnterior == NULL)
      {
        raizTopicos = raizTopicos->proximo;
      }
      else
      {
        auxAnterior->proximo = auxAtual->proximo;
      }
        delete[] auxAtual->nome;
        delete auxAtual;
      break;
    }
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

      comando = new char[i + 1];
      for(j; j < i; j++)
      {
        comando[j] = (char)payload[j];
        
      }
   
      comando[j] = '\0';
      j = 0;
     
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
  Serial.printf("comando : %s\n", comando);
  Serial.printf("chave: %s\n", chave);
  
  if(strcmp(comando, "tp") == 0)
  {
    if(strcmp(chave, "1") == 0)
    {
      digitalWrite(OUT_SONOFF, HIGH);
    }
    else
    {
      digitalWrite(OUT_SONOFF, LOW);
    }
  }
  else if(strcmp(comando,"sub") == 0)
  {
    //AdicionarTopico(chave);
    int largura = strlen(chave);
    int index = 0;
    int ultimoindex = 0;
    for(int y = 0; y < largura + 1; y++, index++)
    {
      if(chave[y] == '\r' || chave[y] == '\0')
      {
        char *topico = new char[index + 2]; //+ 1 por causa de posição e + 1 por de \0
        int x;
        int indextmp = 0;
        for(x = ultimoindex; x < y; x++, indextmp++)
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
  else if(strcmp(comando,"unsub") == 0)
  {
    RemoverTopico(chave);
  }
  else if(strcmp(comando,"sts") == 0)
  {

    SONOFF_STATUS = chave[0];
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
  pinMode(OUT_SONOFF, OUTPUT);
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
