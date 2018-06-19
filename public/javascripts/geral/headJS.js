$(function()
{
    var path = window.location.pathname;
    $('nav li a[href="'+path+'"]').parents('li').addClass('active');
});
function FormatarDate(data, separador)
{
    try
    {
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
    catch(err)
    {
        data = new Date(data);
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
        
}
function LimparObj(obj)
{
    for(var chave in obj)
    {
        if(typeof(obj[chave]) == "object")
        {
            LimparObj(obj[chave])
        }
        else if(typeof(obj[chave]) == "string")
        {
            obj[chave] = obj[chave].replace(/&/g, '&amp;').
            replace(/</g, '&lt;').  
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
        }
    }
}
