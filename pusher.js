const Pusher = require('pusher-js');
const Gpio = require('onoff').Gpio;
var pusher = new Pusher('32561c96d460f8297c62', {
    cluster: 'ap1'
});

var channel = pusher.subscribe('logger');
channel.bind('power', function(data) {
    
    console.log(data.message);
});