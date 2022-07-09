const Gpio = require('onoff').Gpio;

exports.pump = new Gpio(26, 'out')