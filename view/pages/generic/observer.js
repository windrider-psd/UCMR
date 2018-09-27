if(typeof(window.eventos) == 'undefined')
    window.eventos = {}

function Observar (eventName, callback) {
    let evento = window.eventos[eventName]
    if(typeof(evento) == 'undefined')
        window.eventos[eventName] = {estado : false, callbacks : [callback]}
    else
    {
        evento.callbacks.push(callback)
        if(evento.estado == true)
        {
            callback()
        }
    }
}
function Trigger(eventName, param)
{
    let evento = eventos[eventName]
    if(typeof(evento) == 'undefined')
    {
        window.eventos[eventName] = {estado : true, callbacks : []}
    }
    else
    {
        for(let i = 0; i < evento.callbacks.length; i++)
        {
            evento.callbacks[i](param);
        }
        evento.estado = true
    }

}

module.exports = {
    Trigger : Trigger,
    Observar : Observar
}