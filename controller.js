require('dotenv').config();
const db = require('./config');
const baseURLDLH = process.env.BASE_URL_DLH
const baseURLKLHK = process.env.API_KLHK
const axios = require('axios');
const klhk = process.env.KLHK
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
                        console.log(data.length);
                        (async () => {
                            for(let logger of data) {

                                // TO API SERVER DLH
                                await axios.post(baseURLDLH+'/logger/modbus', logger, {
                                    headers: {
                                        Authorization: `Bearer ${res.data.token}`
                                    }
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
                                    axios.post(baseURLKLHK, onlimo)
                                    .then(res => {
                                        console.log(res.data);
                                    })
                                }
                                
                                
                            }
                        })();
                        // TO API SERVER DLH
                        axios.post(baseURLDLH+'/logger/modbus', logger, {
                            headers: {
                                Authorization: `Bearer ${res.data.token}`
                            }
                        })

                        // TO API SERVER KLHK
                        if(klhk == 'true') {
                            axios.post(baseURLKLHK, onlimo)
                        }
                       

                        db.serialize(function () {
                            let sql = 'DELETE FROM logger'
                            db.run(sql)
                        })
                    } else {
                        // TO API SERVER DLH
                        axios.post(baseURLDLH+'/logger/modbus', logger, {
                            headers: {
                                Authorization: `Bearer ${res.data.token}`
                            }
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
            console.log('error push data');
        }
    })
    .catch(err => {
        console.log('err get token');
    })
}

exports.offLine = (logger) => {
    console.log('offline', logger);
    db.serialize( function() {
        let sql = `INSERT INTO logger(ph, do, cond, turb, temp, salt, dept, addedAt) 
        VALUES('${logger.ph}','${logger.do}','${logger.cond}','${logger.turb}','${logger.temp}','${logger.salt}','${logger.dept}','${logger.addedAt}')`
        db.run(sql, (err) => {
            if(err) throw err
        })
    })
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