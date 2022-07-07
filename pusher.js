const Pusher = require('pusher-js');
const Gpio = require('onoff').Gpio;
const watcher = require('./watcher')

// const pump = new Gpio(26, 'out')
// pump.writeSync(1)


var pusher = new Pusher('32561c96d460f8297c62', {
    cluster: 'ap1'
});
var channel = pusher.subscribe('logger');
channel.bind('power', function(data) {
    // pump.writeSync(data.message)
    watcher.status.pump = data.message
});