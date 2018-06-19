/*var $canvas;
var inserirObj = null; //src, tipo, $obj
var contador_id = 1;
function IniciarSimulador(canvas)
{
    canvas.style.width = "1200px";
    canvas.style.height = "600px";
    canvas.style.border = "1px solid black";
    canvas.style.position = "relative";
    canvas.style.backgroundImage = 'url(images/simulador/texturagrama.jpg)';
    $canvas  = $("#"+canvas.id);

    $(".simulador-inserir-img").on({

        mouseenter : function()
        {
            $(this).addClass("simulador-inserir-img_selected");
        },
        mouseleave: function () {
            if($(this).data('selected') == "0")
            {   
                $(this).removeClass("simulador-inserir-img_selected");
            }
        },
        click : function()
        {
            if($(this).hasClass('simulador-inserir-img-selected') == false) //Se não tiver selecionado
            {
                var src = $(this).attr('src');
                var tipo = $(this).data('tipo');
                $(".simulador-inserir-img-selected").data('selected', "0");
                $(".simulador-inserir-img-selected").removeClass("simulador-inserir-img-selected");
                
                inserirObj = {src : src, tipo : Number(tipo), $obj : $(this)};
                $(this).addClass("simulador-inserir-img-selected");
            }
            else
            {
                $(".simulador-inserir-img-selected").removeClass("simulador-inserir-img-selected");
                inserirObj = null;
            }
            
        }
        
    });
    $canvas.on(
    {
        click : function(evento)
        {
            
        
            if(inserirObj !== null)
            {
                var alvo = $(evento.target);
                var mousepos = GetMousePos($(this), evento);
                var imagem = GetDrawObj();
                InserirObjeto(imagem, mousepos, inserirObj.tipo);
            }
            
        }
    })  
}


function GetMousePos(canvas, evento)
{
    var x = evento.pageX - canvas.offset().left;
    var y = evento.pageY - canvas.offset().top;
    return {x : x, y : y};
}

function GetDrawObj()
{
    imagem = new Image();
    imagem.src = inserirObj.$obj.attr("src");
    var width;
    var height;
    var zindex;
    switch(inserirObj.tipo)
    {
        case 1: //Painel solar
            height = 120;
            width = 120;
            zindex = 1001;
            break;
        case 2: //porta
            height = 30;
            width = 30;
            zindex = 1002;
            break;
        case 3: //sala
            height = 90;
            width = 90;
            zindex = 1001;
            break;
    }


    imagem.width = width;
    imagem.height = height;
    imagem.style.zIndex  = zindex;
    imagem.style.position = "absolute";
    return imagem;
}

function InserirObjeto(imagem, mousepos, tipo)
{
    var posfinal = {x : mousepos.x  - imagem.width / 2, y : mousepos.y - imagem.height};
    imagem.style.left = posfinal.x +"px";
    imagem.style.top = posfinal.y + "px";
    imagem.setAttribute('data-id', contador_id);
    contador_id++;
    imagem.setAttribute('data-tipo', tipo);
    imagem.className = "canvas-obj";
    $canvas.append(imagem);
}*/



