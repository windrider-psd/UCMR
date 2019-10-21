let $ = require('jquery')
let utils = require('./../../generic/utils')
let observer = require('./../../generic/observer')
let lodash = require('lodash')
let gets = utils.ParseGET()


$(document).ready(function() {
    
    $("#users-content").on("click", ".btn-edit-user", function()
    {
        let row = $(this).parent().parent();
        let id = row.attr("data-id");
        let username = row.attr("data-username");
        let admin = row.attr("data-admin");
        
        $("#edit-user-username-form_id").val(id)
        $("#edit-user-admin-form_id").val(id)
        $("#edit-user-password-form_id").val(id)

        $("#edit-user-username-form_input").val(username)
        $("#edit-user-admin-form_select").val(admin);
        
        $("#edit-user-modal").modal('show');
    })

    $("#users-content").on("click", ".btn-delete-user", function()
    {
        let row = $(this).parent().parent();
        let id = row.attr("data-id");
        console.log(id)
        $.ajax({
            url: '/usuarios/usuario',
            method: 'DELETE',
            data: {id : id},
            dataType: "JSON",
            beforeSend: () =>{
                $(this).addClass("disabled")
            },
            success: () => {
                utils.GerarNotificacao("Usuário excluído com sucesso", "success")
                UpdateUserContent();
            },
    
            error: function (err) {
                utils.GerarNotificacao(err.responseText, "danger")
                $(this).removeClass("disabled")
            }
        })
    })

    $("#add-user-btn").on('click', function() {
        $("#add-user-modal").modal('show');
    })

    $("#edit-user-username-form").on('submit', function(){
        let params = utils.FormToAssocArray($(this));
        if(params.username.length < 4)
        {
            utils.GerarNotificacao('O nome precisa ter no minimo 4 letras', "danger");
            return;
        }
        UpdateUser(params.id, params.username, undefined, undefined)
    })

    $("#edit-user-admin-form").on('submit', function(){
        let params = utils.FormToAssocArray($(this));
        UpdateUser(params.id, undefined, params.admin == "true", undefined)
    })

    $("#edit-user-password-form").on('submit', function(){
        let params = utils.FormToAssocArray($(this));
        if(params['password-conf'] != params['password'])
        {
            utils.GerarNotificacao('As senhas não são iguais.', "danger");
            return;
        }
        UpdateUser(params.id, undefined, undefined, params['password'])
    })

    $("#add-user-form").on('submit', function() {
        let data = utils.FormToAssocArray($(this));
        console.log(data);

        if(data['password-conf'] != data['password'])
        {
            utils.GerarNotificacao('As senhas não são iguais.', "danger");
            return;
        }
        if(data['username'].length < 4)
        {
            utils.GerarNotificacao('O nome precisa ter no minimo 4 letras', "danger");
            return;
        }


        data['password-conf'] = undefined


        $.ajax({
            url: '/usuarios/usuario',
            method: 'POST',
            data: data,
            dataType: "JSON",
            beforeSend: function (){
                $('#add-user-form button[type="submit"]').addClass("disabled")
            },
            success: function () {
                UpdateUserContent();
                utils.GerarNotificacao("Usuário criado com sucesso", "success")
            },
    
            error: function (err) {
                utils.GerarNotificacao(err.responseText, "danger")
            },
            complete : function()
            {
                $('#add-user-form button[type="submit"]').removeClass("disabled")
            }
        })
    })


    observer.Observar('user-data-ready', (data) =>{
        UpdateUserContent();
    })


    function UpdateUser(id, username, admin, password)
    {
        let parameters = {username : username, admin : admin, password : password}

        $.ajax({
            url: '/usuarios/usuario?id='+id,
            method: 'PUT',
            data: parameters,
            dataType: "JSON",
            beforeSend: function (){
                $('#edit-user-modal button[type="submit"]').addClass("disabled")
            },
            success: function () {
                UpdateUserContent();
                utils.GerarNotificacao("Usuário editado com sucesso", "success")
            },
    
            error: function (err) {
                utils.GerarNotificacao(err.responseText, "danger")
            },
            complete : function()
            {
                $('#edit-user-modal button[type="submit"]').removeClass("disabled")
            }
        })
    }

    function UpdateUserContent()
    {
        
        $.ajax({
            url: '/usuarios/usuario',
            method: 'GET',
            dataType: "JSON",
            success: function (users) {
                let htmlString = ""
                lodash.each(users, (user) => {
                    htmlString += 
                        `<tr data-id = "${user._id}" data-username = "${user.username}" data-admin = "${user.admin}">
                            <td>${user.username}</td>
                            <td>${user.admin == true ? "<span class=\"text-success\">Sim</span>" : "<span class=\"text-danger\">Não</span>"}</td>
                            <td>
                                <button class = "btn btn-primary btn-edit-user">
                                    <i class = "fa fa-edit"></i>
                                </button>
                                <button class = "btn btn-danger btn-delete-user">
                                    <i class = "fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>`
                })
                $("#users-content").html(htmlString);
                if(users.length < 2)
                {
                    $("#users-content .btn-delete-user").remove();
                }
            },
    
            error: function (err) {
                
            }
        })
    }
})
 