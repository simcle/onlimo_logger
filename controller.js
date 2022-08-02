require('dotenv').config();
const db = require('./config');
const baseURLDLH = process.env.BASE_URL_DLH
const baseURLKLHK = process.env.API_KLHK
const axios = require('axios');
const klhk = process.env.KLHK;
const watcher = require('./watcher');

const pump = require('./gpio').pump;
const valve = require('./gpio').valve;
pump.writeSync(1)
valve.writeSync(1)

exports.onLine = (logger, onlimo) => {
    axios.post(baseURLDLH+'/auth/station', {
        stationId: process.env.STATION_ID
    })
    .then(res => {
        try {         
            db.serialize(function () {
                let sql = 'SELECT * FROM logger'
                db.all (sql, (err, data) => {
                    if(err) throw err
                    if(data.length > 0) {
                        (async () => {
                            for(let logger of data) {

                                // TO API SERVER DLH
                                await axios.post(baseURLDLH+'/logger/modbus', logger, {
                                    headers: {
                                        Authorization: `Bearer ${res.data.token}`
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                                // TO API SERVER KLHK
                                if(klhk == 'true') {
                                    let onlimo = {
                                        data: {
                                            IDStasiun: process.env.STATION_ID,
                                            Tanggal: tanggal(logger.addedAt),
                                            Jam: jam(logger.addedAt),
                                            Suhu: logger.temp,
                                            DO: logger.do,
                                            PH: logger.ph,
                                            Salinitas: logger.salt,
                                            Turbidity: logger.turb,
                                        },
                                        apikey: process.env.APIKEY,
                                        apisecreet: process.env.APISECREET
                                    }
                                    await axios.post(baseURLKLHK, onlimo)
                                    .then(res => {
                                        console.log(res.data);
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                                }
                            }
                            // TO API SERVER DLH
                            await axios.post(baseURLDLH+'/logger/modbus', logger, {
                                headers: {
                                    Authorization: `Bearer ${res.data.token}`
                                }
                            })
                            .catch(err => {
                                console.log(err);
                            })
                            // TO API SERVER KLHK
                            if(klhk == 'true') {
                                await axios.post(baseURLKLHK, onlimo)
                                .catch(err => {
                                    console.log(err);
                                })
                            }
                           
    
                            db.serialize(function () {
                                let sql = 'DELETE FROM logger'
                                db.run(sql)
                            })
                            pump.writeSync(1)
                            watcher.status.pump = 1
                        })();
                    } else {
                        // TO API SERVER DLH
                        axios.post(baseURLDLH+'/logger/modbus', logger, {
                            headers: {
                                Authorization: `Bearer ${res.data.token}`
                            }
                        })
                        .then(() => {
                            pump.writeSync(1)
                            watcher.status.pump = 1
                        })

                        // TO API SERVER KLHK
                        if(klhk == 'true') {
                            axios.post(baseURLKLHK, onlimo)
                            .then(res => {
                                console.log(res.data);
                            })
                        }
                    }
                })
            })

        } catch (error) {
            pump.writeSync(1)
            watcher.status.pump = 1
            console.log('error push data');
        }
    })
    .catch(err => {
        console.log('err get token');
        pump.writeSync(1)
        watcher.status.pump = 1
    })
}

exports.offLine = (logger) => {
    console.log('offline', logger);
    db.serialize( function() {
        let sql = `INSERT INTO logger(ph, do, cond, turb, temp, salt, dept, addedAt) 
        VALUES('${logger.ph}','${logger.do}','${logger.cond}','${logger.turb}','${logger.temp}','${logger.salt}','${logger.dept}','${logger.addedAt}')`
        db.run(sql, (err) => {
            if(err) throw err
            pump.writeSync(1)
            watcher.status.pump = 1
        })
    })
}

exports.powerPump = (req) => {
    console.log(req)
    valve.writeSync(req)
    const pumpTimeout = setTimeout(() => {
        pump.writeSync(0)
        watcher.status.pump = 0
    }, 60000)
    const valveTimeoutOff = setTimeout(() => {
        valve.writeSync(1)
    }, 75000)
    const valveTimeoutOn = setTimeout(() => {
        valve.writeSync(0)
    }, 100000)

    if(req == 1) {
        clearTimeout(pumpTimeout)
        clearTimeout(valveTimeoutOn)
        clearTimeout(valveTimeoutOff)
        pump.writeSync(req)
        watcher.status.pump = req
    } 
    
}

function tanggal (time) {
    const date =  new Date(time)
    let y = date.getFullYear()
    let m = date.getMonth()+1
    let d = date.getDate()
    m = chekTime(m)
    d = chekTime(d)
    let tanggal = `${y}-${m}-${d}`
    function chekTime(i) {
        if(i < 10) {
            i = `0${i}`
        }
        return i
    }
    return tanggal
}

function jam (time) {
    const date =  new Date(time)
    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()
    hh = chekTime(hh)
    mm = chekTime(mm)
    ss = chekTime(ss)
    let jam = `${hh}:${mm}:${ss}`
    function chekTime(i) {
        if(i < 10) {
            i = `0${i}`
        }
        return i
    }
    return jam
}