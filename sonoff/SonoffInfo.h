#include <PubSubClient.h>
#include <ESP8266WiFi.h>

#ifndef SONOFFINFO_H
#define SONOFFINFO_H
typedef struct topico
{
    char *nome;
    struct topico *proximo;
}Topico;

class SonoffInfo
{
    protected:
        int OUTPUT_PIN;
        int LED_PIN;
        int BTN_PIN;
        bool LOGICA_INV_LED;
        char SONOFF_STATUS;
        char* ID_CLIENTE;
        Topico *raizTopicos;
        int totalTopicos;
        WiFiClient espClient;
        PubSubClient MQTT;
        void CriarID();
        void LigarLed();
        void DesligarLed();
        void LigarSonoff();
        void DesligarSonoff(); 
    public:
        void InscreverTodosTopicos();
        void AdicionarTopico(char*);
        void RemoverTopico(char*);
        void ImprimirTopicos() const;
        void ReconnectMQTT();
        void ReconnectWiFi();
        void Loop();
        void mqtt_callback(char* topic, byte* payload, unsigned int length);
        void Iniciar();
        void Conectar(const char*, const char*, const char*, int);
        int GetOutput() const;
        int GetLed() const;
        int GetBtn() const;
        char GetStatus() const;
        char* GetID() const;
        PubSubClient GetMQTT() const;
        SonoffInfo(int);
};

#endif

