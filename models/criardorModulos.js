const cp = require('child_process');

class CriadorModulos
{
    static CriarFork(nome, parametros) //1 = painel Solar
    {
        var child = cp.fork(nome, parametros, {cwd: "./modulos"});
        return child;
    }
    static CriarSpawn(nome, parametros)
    {
        var spawn = cp.spawn;
        var par = Array();
        par.push('./modulos/' + nome);
        if(parametros.length > 0)
        {
            for(var i = 0; i < parametros.length; i++)
            {
                par.push(parametros[i]);
            }
        }
        var processo = spawn('python', par);
        return processo;
        
    }
}

module.exports = CriadorModulos;