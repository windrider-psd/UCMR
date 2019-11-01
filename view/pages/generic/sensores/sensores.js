let $ = require('jquery')
let utils = require('./../../generic/utils')
let observer = require('./../../generic/observer')

let timeFormat = 'DD-MM-YYYY hh:mm:ss';
let lodash = require('lodash')
let Chart = require('chart.js')
require('chartjs-plugin-zoom')

let gets = utils.ParseGET()


function getRandomColor()
{
	let letters = '0123456789ABCDEF'.split('');
	let color = '#';
	for (let i = 0; i < 6; i++)
	{
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

$(document).ready(function() {
    $.ajax(
    {
        url: '/comandos/sonoff/getsonoffs',
        method: 'GET',
        dataType: 'JSON',
        success: function (resposta)
        {
            console.log(resposta)
            let dataSets = {};
            let ids = new Array();

            for(let i = 0; i < resposta.length; i++)
            {
                for(let j = 0; j < resposta[i].sensordata.lenght; j++)
                {
                    let id = resposta[i].codigo + "/" + resposta[i].sensordata[j].type;

                    if(lodash.find(ids, (value) => {return value == id}) == null)
                    {
                        let color = getRandomColor();
                        dataSets[id] = {
                            _id: id,
                            label: id,
                            backgroundColor: color,
                            borderColor: color,
                            lineTension: 0,
                            fill: false,
        
                            data: []
                        };
                        ids.push(id);
                    }

                    dataSets[id].data.push({
                        x: utils.FormatarDate(resposta[i].sensordata[j].time, "-"),
						y: resposta[i].sensordata[j].value
                    })
                }
            }

            let config = {
                type: 'line',
                data:
                {
                    datasets: Object.entries(dataSets)
                },
                options:
                {
                    title:
                    {
                        text: 'Chart.js Time Scale'
                    },

                    scales:
                    {
                        xAxes: [
                        {
                            type: 'time',
                            time:
                            {
                                parser: timeFormat,
                                tooltipFormat: 'll HH:mm'
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Horário'
                            }
                        }],
                        yAxes: [
                        {
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Valor'
                            }
                        }]
                    },
                    pan:
                    {
                        enabled: true,
                        mode: 'xy'
                    },

                    zoom:
                    {
                        enabled: true,
                        drag: false,
                        mode: 'xy',
                    }
                }
            };

            let ctx = document.getElementById('canvas').getContext('2d');
            new Chart(ctx, config);
        },
        error: function ()
        {
            utils.GerarNotificacao("Houve um erro na aplicação.", "danger");
        }
    });
})
 