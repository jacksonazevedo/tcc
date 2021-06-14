let host = 'io.adafruit.com';
let port = 443;
let topic = 'jacksonnazevedo/feeds/+';
let useTLS = true;
let cleansession = true;
let reconnectTimeout = 3000;
let tempData = new Array();
let mqtt;
let userr = "jacksonnazevedo";
let passwordd = "aio_JQoF73Ejlti3CFy9UJM5Z2rJzOkK";

function MQTTconnect() {
    if (typeof path == "undefined") {
        path = '/';
    }
    mqtt = new Paho.MQTT.Client(host, port,path);
    let options = {
		userName: userr,
		password: passwordd,	
		useSSL:true,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').html("Connection failed: " + message.errorMessage + "Retrying...")
                .attr('class', 'alert alert-danger');
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };
    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    //console.log("Host: " + host + ", Port: " + port + ", Path: " + path + " TLS: " + useTLS);
    mqtt.connect(options);
};

function onConnect() {
    $('#status').html('Connected to ' + host + ':' + port + path)
        .attr('class', 'alert alert-success');
    mqtt.subscribe(topic, { qos: 0 });
    $('#topic').html(topic);
};

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
    $('#status').html("Connection lost. Reconnecting...")
        .attr('class', 'alert alert-warning');
};

function onMessageArrived(message) {
    let topic = message.destinationName;
    let payload = message.payloadString;
    //console.log("Topic: " + topic + ", Message payload: " + payload);
    $('#message').html(topic + ', ' + payload);
    let topics = topic.split('-');
    let area = topics[1];
	//console.log('Area: '+topic);

    switch (area) {
        case 'gas':
            $('#value1').html('(Switch value: ' + payload + ')');
            if (payload == 'false') {
                $('#label1').text('Sem detecção');
                $('#label1').removeClass('badge-danger').addClass('badge-success');
            } else {
                $('#label1').text('Com detecção');
                $('#label1').removeClass('badge-success').addClass('badge-danger');
            }
            break;
        case 'fumaca':
            $('#value2').html('(Switch value: ' + payload + ')');
            if (payload == 'false') {
                $('#label2').text('Sem detecção');
                $('#label2').removeClass('badge-danger').addClass('badge-success');
            } else {
                $('#label2').text('Com detecção');
                $('#label2').removeClass('badge-success').addClass('badge-danger');
            }
            break;
        case 'temperatura':
            $('#lab1TempSensor').html('(Sensor value: ' + payload + ')');
            $('#lab1TempLabel').text(payload + ' °C');
            $('#lab1TempLabel').addClass('badge-default');

            tempData.push({
                "timestamp": Date().slice(16, 21),
                "temperature": payload
            });
            if (tempData.length > 15) {
                tempData.shift()
            }
            drawChart(tempData);

            break;
        case 'umidade':
			$('#value3').html('(Sensor value: ' + payload + ')');
            $('#basementTempSensor').html('(Sensor value: ' + payload + ')');
            if (payload <= 95) {
                $('#lab2TempLabel').text(payload + ' °%');
                $('#lab2TempLabel').removeClass('badge-danger badge-warning badge-info badge-primary').addClass('badge-success');
            } else if (payload <= 60) {
                $('#lab2TempLabel').text(payload + ' °%');
                $('#lab2TempLabel').removeClass('badge-warning badge-success badge-info badge-primary').addClass('badge-warning');
            } else if (payload <= 30) {
                $('#lab2TempLabel').text(payload + ' °%');
                $('#lab2TempLabel').removeClass('badge-danger badge-success badge-info badge-primary').addClass('badge-danger');
            } 
            break;
        default:
            //console.log('Error: Data do not match the MQTT topic.');
            break;
    }
};

function drawChart(data) {
    let ctx = document.getElementById("tempChart").getContext("2d");
    let temperatures = []
    let timestamps = []

    data.map((entry) => {
        temperatures.push(entry.temperature);
        timestamps.push(entry.timestamp);
    });

    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                backgroundColor: 'rgb(150, 20, 200)',
                borderColor: 'rgb(200, 50, 98)',
                data: temperatures
            }]
        },
        options: {
            legend: {
                display: false
            },
			plugins:{
				decimation: true,
			},
			responsive: true,
			onResize: function(context) {
				for (var id in chart.instances) {
					console.log('teste');
					chart.instances[id].resize();
					chart.instances[id].render(temperatures);
				}
			}
        }
    });
}

$(document).ready(function () {
    drawChart(tempData);
    MQTTconnect();
});