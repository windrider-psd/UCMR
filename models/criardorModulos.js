const cp = require('child_process');
const path = require('path');

class CriadorModulos
{
    static CriarModulo(nome, parametros, tipo) //1 = painel Solar
    {
        var child = cp.fork(nome, parametros, {cwd: "./modulos"});
        return child;
    }
    
}

module.exports = CriadorModulos;