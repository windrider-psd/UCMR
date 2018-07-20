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

function FormToAssocArray(JForm)
{
    var retorno = {};
    $("input", JForm).each(function()
    {
        if($(this).attr('type').toLowerCase() == 'checkbox')
        {
            var check = false;
            if($(this).is(':checked'))
            {
                check = true;
            }

            retorno[$(this).attr('name')] = check;
        }
        else
        {
            retorno[$(this).attr('name')] = $(this).val();
        }
    });

    $("select", JForm).each(function()
    {
        retorno[$(this).attr('name')] = $('option:selected', $(this)).val();
    });
        
    return retorno;

}
