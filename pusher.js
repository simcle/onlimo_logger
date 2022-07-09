require('dotenv').config();
const stationId = process.env.STATION_ID
const Pusher = require('pusher-js');

const controller = require('./controller')

var pusher = new Pusher('32561c96d460f8297c62', {
    cluster: 'ap1'
});
var channel = pusher.subscribe(stationId);
channel.bind('power', function(data) {
    controller.powerPump(data.message)
});
