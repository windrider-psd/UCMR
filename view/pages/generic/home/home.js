let $ = require('jquery')
let utils = require('./../../generic/utils')
let observer = require('./../../generic/observer')

let gets = utils.ParseGET()


$(document).ready(function() {
    

    observer.Observar('user-data-ready', (data) =>{
        
        if(gets['action'] == 'login')
        {
            $("#welcome-message").text(`Bem-vindo, ${data.username}`)
        }
    })
})
 