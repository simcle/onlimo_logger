require('dotenv').config();
const express = require('express');
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
const {io} = require('socket.io-client');
const socket = io(process.env.BASE_URL_DLH)
socket.on('connect', () => {
    socket.emit('station', {stationId: process.env.STATION_ID})
})

// WATCHER
const watcher = require('./watcher');
require('./pusher')

// CREATE DATABASE
require('./migration');

const app = express();

// POST DATA TO SERVER
require('./post')

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


const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 9600,
    stopBits: 2
}, function(err) {
    if(err) {
      watcher.status.transmitter = false 
      console.log(err);
      return
    } 
})

const parser = new ReadlineParser()
port.pipe(parser)

parser.on('data', (data) => {
    watcher.status.transmitter = true
    const sensor = data.split(',')
    watcher.status.transmitter = true
    watcher.modbus.ph = parseFloat(sensor[2]).toFixed(2)
    watcher.modbus.do = parseFloat(sensor[3]).toFixed(2)
    watcher.modbus.cond = parseFloat(sensor[4]).toFixed(2)
    watcher.modbus.turb = parseFloat(sensor[5]).toFixed(2)
    watcher.modbus.temp = parseFloat(sensor[6]).toFixed(2)
    watcher.modbus.salt = parseFloat(sensor[7]).toFixed(2)
    watcher.modbus.dept = parseFloat(sensor[8]).toFixed(2)
})

setInterval (() => {
    // watcher.modbus.ph = Math.floor(Math.random() * 14)
    // watcher.modbus.do = Math.floor(Math.random() * 300)
    // watcher.modbus.cond = Math.floor(Math.random() * 300)
    // watcher.modbus.turb = Math.floor(Math.random() * 150)
    // watcher.modbus.temp = Math.floor(Math.random() * 150)
    // watcher.modbus.salt = Math.floor(Math.random() * 150)
    watcher.modbus.dept = Math.floor(Math.random() * 100)
    port.write(buffer)
}, 1000)

const PORT = 3000 || process.env.PORT
app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
})
