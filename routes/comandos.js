let express = require('express');
let router = express.Router();
const models = require('./../models/DBModels')
let sanitizer = require('sanitizer');
let servidor_mqtt = require('./../models/ServidorMQTT')
function SolarTipoToString(tipo)
{
    tipo = Number(tipo);
    let tipoString;
    switch(tipo)
    {
        case 0:
            tipoString = "Debug";
            break;
        case 1:
            tipoString = "Fronius";
            break;
        default:
            tipoString = "Desconhecido";
    }
    return tipoString;
}

router.get('/sonoff/get-dispositivo', (req, res) => {

    let codigo = req.query.codigo;
  
      models.ModeloDispositivo.findOne({idDispositivo: codigo}, (err, resultado) =>
      {
        if(err)
        {
            res.status(500).end(err.message)
        }
        else if(resultado == null)
        {
            res.status(404).end("Device not found!")
        }
        else
        {
          res.status(200).json(resultado)
        }
        
      });
      
  });

router.get('/sonoff/getsonoffs', (req, res) =>
{
    let dispo = req.app.locals.servidorMosca.GetSimpleDisp();
    let resposta = new Array();
    models.ModeloDispositivo.find({}, (err, resultado) =>
    {
        if(resultado != null && resultado.length > 0)
        {
            for(let i = 0; i < resultado.length; i++)
            {
                resposta.push({codigo : resultado[i].idDispositivo, nome : resultado[i].nome, topicos : resultado[i].topicos, conectado : false, estado : false, debug : resultado[i].debug});
                for(let j = 0; j < dispo.length; j++)
                {
                    if(resultado[i].idDispositivo == dispo[j].codigo)
                    {
                        resposta[i].conectado = true;
                        resposta[i].estado = dispo[j].estado;
                        break;
                    }
                }
            }
        }
        
        res.json(resposta);
    });
   
});

router.get('/sonoff/gettopicos', (req, res) =>
{
    let codigo = req.query.codigo;
    models.ModeloDispositivo.findOne({idDispositivo : codigo}, function (err, resultado)
    {
        if(err)
        {
            res.status(500).end(err.message)
        }
        else if(resultado == null)
        {
            res.status(404).end('Device not found!')
        }
        else
        {
            res.json({topicos : resultado.topicos});
        }
        
    });
});

router.post('/sonoff/removerTopico', (req, res) =>
{
    let codigo = req.body.codigo;
    let topico = req.body.topico;

    let resto = (err) =>
    {
        if(err)
        {
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        }
        else
        {   
            let mensagem = {codigo : codigo, topico : topico};
            let dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();

            req.app.locals.io.Emitir(mensagem.codigo + " rem topico", mensagem);;
            req.app.locals.io.Emitir("topicos updated", dispMsg);

            res.json({mensagem : {conteudo : 'Topico removido com sucesso.', tipo : 'success'}});
        }
    }
    req.app.locals.servidorMosca.DesinscreverTopico(codigo, topico, resto);
    
});

router.post('/sonoff/togglepower', (req, res) =>
{
    let ligar = req.body.valor == "1";
    let filtro = req.body.filtro;
    let codigos = new Array();
    try
    {
        if(req.body.tipo == "codigo")
        {
            let disp = req.app.locals.servidorMosca.GetDispositivo(filtro);
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            disp.Estado = ligar;
            codigos.push(filtro);
            let mensagem = {codigos : codigos, valor : ligar};
            req.app.locals.io.Emitir('att estado sonoff', mensagem);
            if(ligar)
                res.json({mensagem : {conteudo : 'Dispositivo ligado.', tipo : 'success'}});
            else
                res.json({mensagem : {conteudo : 'Dispositivo desligado.', tipo : 'success'}});
            
            
        }
        else if(req.body.tipo == "topico")
        {
            req.app.locals.servidorMosca.PublicarMensagem(filtro,'tp\n'+req.body.valor);
            req.app.locals.servidorMosca.SetEstadoDispTopico(filtro, ligar);
            let disp = req.app.locals.servidorMosca.GetDispInTopico(filtro);
            for(let i = 0; i < disp.length; i++)
            {
                codigos.push(disp[i].codigo);
            }
            let mensagem = {codigos : codigos, valor : ligar};
            req.app.locals.io.Emitir('att estado sonoff', mensagem);
            if(ligar)
                    res.json({mensagem : {conteudo : 'Dispositivos ligados.', tipo : 'success'}});
                else
                    res.json({mensagem : {conteudo : 'Dispositivos desligados.', tipo : 'success'}});
        }
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: ' + err, tipo : 'danger'}});
    }
    

});


router.post('/sonoff/excluir', (req, res) =>
{
    let codigo = req.body.codigo;
    models.ModeloDispositivo.deleteOne({idDispositivo : codigo}, function(err)
    {
        if(err)
            res.json({mensagem : {conteudo : 'Houve um erro ao excluir o sonoff', tipo : 'warning'}});
        else
        {
            let dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();
            req.app.locals.io.Emitir("topicos updated", dispMsg);
            req.app.locals.io.Emitir("update sonoff", dispMsg);
            res.json({mensagem : {conteudo : 'Sonoff excluido com sucesso', tipo : 'success'}});
        }
            
    })
});

router.post('/sonoff/alterarNome', (req, res) =>
{
    let codigo = req.body.codigo;
    let nome = sanitizer.escape(req.body.nome);
    nome = nome.trim();
    nome = nome.replace(/ +(?= )/g,'');
    nome = nome.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    if(nome.length < 1)
    {
        res.json({mensagem : {conteudo : 'O nome deve conter pelo menos 1 caractere.', tipo : 'warning'}});
        return;
    }

    models.ModeloDispositivo.findOne({idDispositivo : codigo}, function(err, resultado)
    {
        if(err || resultado == null)
        {
            res.json({mensagem : {conteudo : 'Dispositivo não encontrado', tipo : 'danger'}});
        }
        else
        {
            resultado.nome = nome;
            resultado.save();

            try
            {
                let dispositivo = req.app.locals.servidorMosca.GetDispositivo(codigo);
                dispositivo.Nome = nome;
            }
            catch(err){}

            let mensagem = {codigo : codigo, nome : nome};
            req.app.locals.io.Emitir('att nome sonoff', mensagem);
            res.json({mensagem : {conteudo : 'Nome alterado para <strong>'+nome+'</strong> com sucesso.', tipo : 'success'}});
        }
    });
});


router.post('/sonoff/inscreverTopico', (req, res) =>
{
    
    let codigo = req.body.codigo;
    let topico = req.body.topico;
    topico = topico.replace(/\s/g, "");
    topico = topico.replace(/\\/g, "/");

    let formatoTopico = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]+/;
    if(formatoTopico.test(topico))
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>Não use caractéres especiais no nome do tópico</strong>.', tipo : 'danger'}});
        return;
    }
    
    let resto = function(err)
    {
        if(err)
        {
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        }
        else
        {   
            let mensagem = {codigo : codigo, topico : topico};
            let dispMsg = req.app.locals.servidorMosca.GetSimpleDisp();

            req.app.locals.io.Emitir(mensagem.codigo + " add topico", mensagem);;
            req.app.locals.io.Emitir("topicos updated", dispMsg);

            res.json({mensagem : {conteudo : 'O dispositivo inscrito no tópico <strong>'+topico+'</strong> com sucesso.', tipo : 'success'}});
        }
    }
    req.app.locals.servidorMosca.InscreverTopico(codigo, topico, resto);
});


router.post('/painel/adicionar', (req, res, next) =>
{
    let nome = sanitizer.escape(req.body.nome);
    
    let host = sanitizer.escape(req.body.host);
    let caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    let tipo = req.body.tipo;
    let obj = {nome : nome, host : host, path : caminho, tipo : tipo};
    obj.logs = [];
    try
    {
        let novo = new models.PainelSolar(obj);
        novo.save();
        req.app.locals.io.Emitir('add painel', novo);
        new models.LogEventos({tempo : new Date(), evento : "Painel solar " +novo.nome+" adicionado", tipo : 2}).save();
        res.json({mensagem : {conteudo : 'Painel solar adicionado com sucesso.', tipo : 'success'}});
    }
    catch(err)
    {
        res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
    }
});

router.post('/painel/excluir', (req, res) =>
{
    let id = req.body.id;

    models.PainelSolar.findOne({_id : id}, function(err, painel)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            painel.remove();
            req.app.locals.io.Emitir('rem painel', id);
            new models.LogEventos({tempo : new Date(), evento : "Painel solar " +painel.nome+" removido", tipo : 2}).save();
            res.json({mensagem : {conteudo : 'Painel solar removido com sucesso.', tipo : 'success'}});
        }
           
    });
    
});

router.get("/painel/getlogsolar", (req, res) =>
{
    models.PainelSolar.find({}, (err, resultado) =>
    {
      res.json({logSolar : resultado});
    });
});

router.get('/painel/excluirlog', (req, res) =>
{

    models.PainelSolar.find({}, (err, paineis) =>
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            new models.LogEventos({tempo : new Date(), evento : "Logs dos paineis solares excluidos", tipo : 2}).save();
            for(let i = 0; i < paineis.length; i++)
            {
                paineis[i].logs = new Array();
                paineis[i].save();
            }

            res.json({mensagem : {conteudo : 'Dados excluidos com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.post('/painel/editar', (req, res) =>
{
    let id = req.body.id;
    let nome = sanitizer.escape(req.body.nome); 
    let caminho = sanitizer.unescapeEntities(req.body.caminho).replace("/</g", "&lt;").replace("/>/g", "&gt;");
    
    let tipo = req.body.tipo;
    let host = sanitizer.escape(req.body.host);

    models.PainelSolar.findOne({_id : id}, (err, painel) =>
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
        {
            painel.nome = nome;
            painel.path = caminho;
            painel.tipo = tipo;
            painel.host = host; 
            painel.save();
            req.app.locals.io.Emitir('att painel', painel);
            new models.LogEventos({tempo : new Date(), evento : "Edição do painel solar "+painel._id+" para: nome = "+painel.nome+", host = "+painel.host+", caminho = "+painel.path+" e tipo =  "+SolarTipoToString(painel.tipo), tipo : 2}).save()
            res.json({mensagem : {conteudo : 'Painel solar editado com sucesso.', tipo : 'success'}});
        }
            
    });
    
});

router.get('/log/getlog', (req, res) =>
{
    models.LogEventos.find({}, function(err, resultado)
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : '', tipo : 'success'}, log : resultado});
    }).sort('-tempo');
});


router.get('/log/excluir', (req, res) =>
{
    models.LogEventos.deleteMany({}, (err, resultado) =>
    {
        if(err) 
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Log excluido com sucesso', tipo : 'success'}, log : resultado});
    })

});



router.post('/residencial/adicionar', (req, res) =>
{
    let cenario = req.body.cenario;
    let novo = new models.SimuladorResidencial(cenario);
    novo.save((err) =>
    {
        if(err)
            res.json({mensagem : {conteudo : 'Erro: <strong>'+err+'</strong>.', tipo : 'danger'}});
        else
            res.json({mensagem : {conteudo : 'Cenário concluido com sucesso', tipo : 'success'}});
    })

});

router.get('/get-server-data', (req, res) => {
    res.status(200).json(req.app.locals.serverdata)
})

router.post('/sensor', (req, res) => {
    let params = req.body
    let servidor = req.app.locals.servidorMosca
    servidor.AdicionarSensor(params.codigo, params.tipo, params.gpio)
        .then(() => {
            res.status(200).end("")
        })
        .catch((err) => {
            res.status(500).end(err.message)
        })
})

module.exports = router;