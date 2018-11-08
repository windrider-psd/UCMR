#include <memory>

#pragma once
namespace patch
{
	template< class T, class... ARGS >
	std::unique_ptr<T> make_unique(ARGS&&... my_args)
	{
		return std::unique_ptr<T>(new T(std::forward<ARGS>(my_args)...));
	}
}