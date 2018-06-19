var idCluster = 1;
$("#form-adicionar-cluster").on('submit', function()
{
    
    var nome = $("#form-adicionar-cluster-nome").val();
    var esta = false;
    $("#tbody-clusters .cluster-nome").each(function()
    {
        let nomecheck = $(this).html();
        if(nomecheck.toLowerCase() == nome.toLowerCase())
        {
            esta = true;
        }
    });
    if(esta)
    {
        GerarNotificacao("Cluster de nome "+nome+" já existe!", "warning");
        return;
    }
    var id = idCluster;
    idCluster++;
    var htmlStringSelect = "<option value = '"+id+"'>"+nome+"</option>";
    var htmlStringTable = "<tr data-id = '"+id+"'><td class = 'cluster-nome'>"+nome+"</td><td><button class = 'btn btn-primary btn-editar-cluster'><i class = 'fa fa-edit' title = 'Alterar'></i></button><button class = 'btn btn-danger btn-excluir-cluster'><i class = 'fa fa-times' title = 'Excluir'></i></button></td></tr>";
    $("#form-adicionar-painel-cluster").append(htmlStringSelect);
    $("#tbody-clusters").append(htmlStringTable);
});
$("#form-adicionar-painel").on('submit', function()
{
    var nome = $("#form-adicionar-painel-nome").val();
    var potencia = $("#form-adicionar-painel-potencia").val();
    var esta = false;
    
    $("#tbody-paineis .painel-nome td").each(function()
    {
        let nomecheck = $(this).html();
        if(nomecheck.toLowerCase() == nome.toLowerCase())
        {
            esta = true;
        }
    });
    if(!esta)
    {
        var htmlString = "<tr class = 'painel-nome'><td>"+nome+"</td><td>"+potencia+" Watts</td><td><button class = 'btn btn-primary btn-editar-painel'><i class = 'fa fa-edit' title = 'Alterar'></i></button><button class = 'btn btn-danger btn-excluir'><i class = 'fa fa-times' title = 'Excluir'></i></button></td></tr>";
        $("#tbody-paineis").append(htmlString);
    }
    else
    {
        GerarNotificacao(nome + " já existe!", "warning");
    }
    
});

$("body").on('click', ".btn-excluir", function()
{
    $(this).parent().parent().remove(); 
});