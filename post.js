require('dotenv').config();
const isOnline = require('is-online');
const controller = require('./controller')
const pump = require('./gpio').pump;
const valve = require('./gpio').valve;

const logger = require('./logger');
const watcher = require('./watcher');
const modbus = logger.modbus
setInterval(() => {
    const date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth()+1
    let d = date.getDate()
    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()
    m = chekTime(m)
    d = chekTime(d)
    hh = chekTime(hh)
    mm = chekTime(mm)
    ss = chekTime(ss)
    let tanggal = `${y}-${m}-${d}`
    let jam = `${hh}:${mm}:${ss}`
    function chekTime(i) {
        if(i < 10) {
            i = `0${i}`
        }
        return i
    }
    let data = {
        ph: modbus.ph,
        do: modbus.do,
        cond: modbus.cond,
        turb: modbus.turb,
        temp: modbus.temp,
        salt: modbus.salt,
        dept: modbus.dept,
        addedAt: date
    }

    let onlimo = {
        data: {
            IDStasiun: process.env.STATION_ID,
            Tanggal: tanggal,
            Jam: jam,
            Suhu: modbus.temp,
            DO: modbus.do,
            PH: modbus.ph,
            Salinitas: modbus.salt,
            Turbidity: modbus.turb,
        },
        apikey: process.env.APIKEY,
        apisecreet: process.env.APISECREET
    }
    // send data to controller in hour
    if(mm == 57) {
        valve.writeSync(0)
    }
    if(mm == 58) {
        pump.writeSync(0)
        watcher.status.pump = 0
    }
    if(mm == 59 && ss == 50) {
        pump.writeSync(1)
        valve.writeSync(1)
    }
    if (mm == 00 && ss == 00) {
        isOnline()
        .then((res) => {
            if(res) {
                controller.onLine(data, onlimo)
            } else {
                controller.offLine(data)
            }
        })
    }
}, 1000)
