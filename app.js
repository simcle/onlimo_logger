const express = require('express');
const onChange = require('on-change');
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');

require('./pusher')

// CREATE DATABASE
const migration = require('./migration');
migration()

const app = express();
const logger = require('./logger');
const post = require('./post')



// RS232
const buffer = new Buffer.alloc(8);
buffer[0] = 0x43;
buffer[1] = 0x48;

buffer[2] = 0x30;
buffer[3] = 0x30;

buffer[4] = 0x2C;

buffer[5] = 0x44;

buffer[6] = 0x0D;
buffer[7] = 0x0A;

const loggerChange = onChange(logger, () => {
    // console.log('');
})

const port = new SerialPort({
    path: '/dev/tty.usbmodemFA131',
    baudRate: 9600,
    stopBits: 2
}, function(err) {
    if(err) {
      loggerChange.status.transmitter = false 
      return
    } 
})

const parser = new ReadlineParser()
port.pipe(parser)

parser.on('data', (data) => {
    loggerChange.status.transmitter = true
    const sensor = data.split(',')
    loggerChange.modbus.status.transmitter = true
    loggerChange.modbus.ph = parseFloat(sensor[2]).toFixed(2)
    loggerChange.modbus.do = parseFloat(sensor[3]).toFixed(2)
    loggerChange.modbus.cond = parseFloat(sensor[4]).toFixed(2)
    loggerChange.modbus.turb = parseFloat(sensor[5]).toFixed(2)
    loggerChange.modbus.temp = parseFloat(sensor[6]).toFixed(2)
    loggerChange.modbus.salt = parseFloat(sensor[7]).toFixed(2)
    loggerChange.modbus.dept = parseFloat(sensor[8]).toFixed(2)
})

setInterval (() => {
    loggerChange.modbus.ph = Math.floor(Math.random() * 14)
    loggerChange.modbus.do = Math.floor(Math.random() * 300)
    loggerChange.modbus.cond = Math.floor(Math.random() * 300)
    loggerChange.modbus.turb = Math.floor(Math.random() * 150)
    loggerChange.modbus.temp = Math.floor(Math.random() * 150)
    loggerChange.modbus.salt = Math.floor(Math.random() * 150)
    loggerChange.modbus.dept = Math.floor(Math.random() * 100)
    port.write(buffer)
}, 1000)

post(logger.modbus)

const PORT = 5000 || process.env.PORT
app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
})
