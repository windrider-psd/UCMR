#include "ReceptorIV.h"


husky::ReceptorIV::ReceptorIV(unsigned int _gpio) : gpio(_gpio), receptor(_gpio)
{
	this->receptor.enableIRIn();

}

void husky::ReceptorIV::setGPIO(unsigned int _gpio)
{
	this->receptor = IRrecv(_gpio);
	this->receptor.enableIRIn();
}

void husky::ReceptorIV::setCallback(callback_signature _callback)
{
	this->callback = _callback;
}

void husky::ReceptorIV::lerReceptor()
{
	if (this->receptor.decode(&this->resultadosReceptor))
	{
		this->callback(this->resultadosReceptor);
		this->receptor.resume();
		
	}
}

husky::ReceptorIV::~ReceptorIV()
{
}


