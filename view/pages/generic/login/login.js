let $ = require('jquery')
let utils = require('./../../generic/utils')
let observer = require('./../../generic/observer')

let gets = utils.ParseGET()


$(document).ready(function() {
    $("#form-login").on('submit', function() {
        let data = utils.FormToAssocArray($(this));

        $.ajax({
            data : data,
            url : "usuarios/login",
            method : "POST",
            dataType: "JSON",
            success : (retorno) => {
                window.location.reload();
            },
            error : (err) => {
                console.log(err);
            }
        })

    })
})