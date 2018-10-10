const cp = require('child_process');

class CriadorModulos
{
    CriarFork(nome, parametros) //1 = painel Solar
    {
        let child = cp.fork(nome, parametros, {cwd: "./modulos"});
        return child;
    }
    CriarSpawn(nome, parametros)
    {
        let spawn = cp.spawn;
        let par = Array();
        par.push('./modulos/' + nome);
        if(parametros.length > 0)
        {
            for(var i = 0; i < parametros.length; i++)
            {
                par.push(parametros[i]);
            }
        }
        let processo = spawn('python', par);
        return processo;
        
    }
}

module.exports = new CriadorModulos();