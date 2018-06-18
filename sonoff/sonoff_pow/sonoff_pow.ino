#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include "HLW8012.h"


// GPIOs
#define RELAY_PIN 12
#define SEL_PIN  5
#define CF1_PIN  13
#define CF_PIN  14
#define OUT_SONOFF  12
#define LED_SONOFF  15 

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
HLW8012 hlw8012;

// Check values every 2 seconds
#define UPDATE_TIME                     2000

// Set SEL_PIN to HIGH to sample current
// This is the case for Itead's Sonoff POW, where a
// the SEL_PIN drives a transistor that pulls down
// the SEL pin in the HLW8012 when closed

#define CURRENT_MODE                    HIGH

// These are the nominal values for the resistors in the circuit
#define CURRENT_RESISTOR                0.001
#define VOLTAGE_RESISTOR_UPSTREAM       ( 5 * 470000 ) // Real: 2280k
#define VOLTAGE_RESISTOR_DOWNSTREAM     ( 1000 ) // Real 1.009k


void unblockingDelay(unsigned long mseconds) {
    unsigned long timeout = millis();
    while ((millis() - timeout) < mseconds) delay(1);
}

void calibrate() {

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
      digitalWrite(LED_SONOFF, HIGH);
      delay(500);
      digitalWrite(LED_SONOFF, LOW);
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

    Serial.printf("\n");
    Serial.printf("\n");

    // Close the relay to switch on the load
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, HIGH);

    hlw8012.begin(CF_PIN, CF1_PIN, SEL_PIN, CURRENT_MODE, false, 500000);


    hlw8012.setResistors(CURRENT_RESISTOR, VOLTAGE_RESISTOR_UPSTREAM, VOLTAGE_RESISTOR_DOWNSTREAM);

    Serial.printf("[HLW] Default current multiplier : "); Serial.println(hlw8012.getCurrentMultiplier());
    Serial.printf("[HLW] Default voltage multiplier : "); Serial.println(hlw8012.getVoltageMultiplier());
    Serial.printf("[HLW] Default power multiplier   : "); Serial.println(hlw8012.getPowerMultiplier());
    Serial.printf("\n");

  
    WiFi.begin("dlink", NULL); //nome e senha da wifi. NULL para a senha se a wifi for aberta.

    //precisa de um loop para se conectar já que demora um tempinho
    while (WiFi.status() != WL_CONNECTED) 
    {
      digitalWrite(LED_SONOFF, HIGH); 
      delay(100);
      digitalWrite(LED_SONOFF, LOW);
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
  static unsigned long last = millis();

  if ((millis() - last) > UPDATE_TIME) {

      last = millis();
      Serial.print("[HLW] Active Power (W)    : "); Serial.println(hlw8012.getActivePower());
      Serial.print("[HLW] Voltage (V)         : "); Serial.println(hlw8012.getVoltage());
      Serial.print("[HLW] Current (A)         : "); Serial.println(hlw8012.getCurrent());
      Serial.print("[HLW] Apparent Power (VA) : "); Serial.println(hlw8012.getApparentPower());
      Serial.print("[HLW] Power Factor (%)    : "); Serial.println((int) (100 * hlw8012.getPowerFactor()));
      Serial.println();

      // When not using interrupts we have to manually switch to current or voltage monitor
      // This means that every time we get into the conditional we only update one of them
      // while the other will return the cached value.
      hlw8012.toggleMode();

  }

  
}
