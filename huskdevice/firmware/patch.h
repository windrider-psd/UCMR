#include <memory>
#include <vector>
#include <string>
#include <time.h>
#pragma once
namespace patch
{
	template< class T, class... ARGS >
	std::unique_ptr<T> make_unique(ARGS&&... my_args)
	{
		return std::unique_ptr<T>(new T(std::forward<ARGS>(my_args)...));
	}
	

	inline std::vector<std::string> split(std::string string, char c)
	{
		std::vector<std::string> retorno;
		std::string novaString;

		for (std::string::iterator it = string.begin(); it != string.end(); ++it)
		{
			if (*it == c)
			{
				retorno.emplace_back(novaString);
				novaString.clear();
			}
			else
			{
				novaString += *it;
			}
		}

		retorno.emplace_back(novaString);

		return retorno;
	}
}