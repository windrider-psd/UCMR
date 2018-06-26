#include "SonoffInfo.h"
using namespace std;

void SonoffInfo::LigarLed()
{
  if(LOGICA_INV_LED == true)
  {
    digitalWrite(LED_PIN, LOW);
  }
  else
  {
    digitalWrite(LED_PIN, HIGH);
  }
}

void SonoffInfo::DesligarLed()
{
  if(LOGICA_INV_LED == true)
  {
    digitalWrite(LED_PIN, HIGH);
  }
  else
  {
    digitalWrite(LED_PIN, LOW);
  }
}

void SonoffInfo::LigarSonoff()
{
  digitalWrite(OUTPUT_PIN, HIGH);
  SONOFF_LIGADO = 1;
}

void SonoffInfo::DesligarSonoff()
{
  digitalWrite(OUTPUT_PIN, LOW);
  SONOFF_LIGADO = 0;
}

void SonoffInfo::InscreverTodosTopicos()
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

void SonoffInfo::AdicionarTopico(char *topico)
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

void SonoffInfo::ImprimirTopicos() const
{
  for(Topico *aux = raizTopicos; aux != NULL; aux = aux->proximo)
  {
    Serial.printf("Topico: %s\n", aux->nome);
  }
  Serial.printf("-------------------\n");
}

void SonoffInfo::RemoverTopico(char *topico)
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

void SonoffInfo::EnviarMensagemLigado()
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


void SonoffInfo::EnviarMensagemStatus()
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


void SonoffInfo::ReconnectMQTT() 
{
    if (MQTT.connect(ID_CLIENTE)) 
    {
      InscreverTodosTopicos();
      EnviarMensagemStatus();
      EnviarMensagemLigado();
    }
}

void SonoffInfo::ReconnectWiFi() {
  while (WiFi.status() != WL_CONNECTED) {
    
  }
}

void SonoffInfo::mqtt_callback(char* topic, byte* payload, unsigned int length) 
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
      LigarSonoff();
     // LigarLed();
    }
    else
    {
      DesligarSonoff();
      //DesligarLed();
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

void SonoffInfo::CriarID()
{
  String idstr = WiFi.macAddress();
  ID_CLIENTE = new char[idstr.length() + 1];
  idstr.toCharArray(ID_CLIENTE,  idstr.length() + 1);
}

SonoffInfo::SonoffInfo(int tipo)//0 = basic, 1 = pow
{
    switch(tipo)
    {
      case 0: //basic      
        OUTPUT_PIN = 12;
        LED_PIN = 13;
        BTN_PIN = 0;
        LOGICA_INV_LED = true;
        break;
      case 1: //pow
         OUTPUT_PIN = 12;
         LED_PIN = 15;
         BTN_PIN = 0;
         LOGICA_INV_LED = false;
         break;
      default:
      {
        Serial.printf("Tipo inválido\n");
        return;
      }
    }
}

void SonoffInfo::Iniciar() 
{
    pinMode(OUTPUT_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BTN_PIN, INPUT);
    CriarID();
    SONOFF_STATUS = '0';
    totalTopicos = 0;
    raizTopicos = NULL;
    MQTT = PubSubClient(espClient);

}

void SonoffInfo::Conectar(const char *ssid, const char *senha, const char *servidor, int porta)
{
  WiFi.begin(ssid, senha); //nome e senha da wifi. NULL para a senha se a wifi for aberta.

  //precisa de um loop para se conectar já que demora um tempinho
  while (WiFi.status() != WL_CONNECTED) 
  {
    LigarLed();
    delay(100);
    DesligarLed();
    delay(100);
  }
  MQTT.setServer(servidor, porta); //Endereço de ip e porta do broker MQTT
  MQTT.setCallback(std::bind(&SonoffInfo::mqtt_callback, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
}

void SonoffInfo::Loop()
{
  int btn_estado_atual = digitalRead(BTN_PIN);

  if(btn_estado_atual == 0 && btn_estado_atual != BTN_ESTADO)
  {
    if(SONOFF_LIGADO == 0)
    {
      LigarSonoff();
    }
    else
    {
      DesligarSonoff();
    }
    if(MQTT.connected())
    {
      EnviarMensagemLigado();
    }
    
  }
  BTN_ESTADO = btn_estado_atual;
  if (!MQTT.connected()) {
    ReconnectMQTT();
  }
  else
  {
    MQTT.loop();
  }
  
  
}

int SonoffInfo::GetBtn() const{return BTN_PIN;}
int SonoffInfo::GetLed() const{return LED_PIN;}
PubSubClient SonoffInfo::GetMQTT() const{return MQTT;}
int SonoffInfo::GetOutput() const{return OUTPUT_PIN;}
char SonoffInfo::GetStatus() const{return SONOFF_STATUS;}
char* SonoffInfo::GetID() const{return ID_CLIENTE;}
