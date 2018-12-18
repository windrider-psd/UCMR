#include "HuskyDevice.h"



void HuskyDevice::enviarMensagem(std::string, const std::string) const
{
}

HuskyDevice::HuskyDevice() : estadoConexao(false), MQTT(espClient)
{
	this->criarID();


}


HuskyDevice::~HuskyDevice()
{
}

void HuskyDevice::enviarMensagemStatus() const
{
}

void HuskyDevice::inscreverTodosTopicos() const
{
}

void HuskyDevice::AdicionarTopico(std::string)
{
}

void HuskyDevice::RemoverTopico(std::string)
{
}

void HuskyDevice::ReconnectMQTT()
{
}

void HuskyDevice::mqtt_callback(char * topic, byte * payload, unsigned int length)
{
}

void HuskyDevice::Conectar(const std::string, const std::string, const std::string, int, const std::string, const std::string)
{
}
