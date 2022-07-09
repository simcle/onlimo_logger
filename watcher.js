require('dotenv').config();
const stationId = process.env.STATION_ID
const onChange = require('on-change');
const logger = require('./logger');
const db = require('./rtb');

const loggerData = db.child(stationId)
const watcher = onChange(logger, () => {
    logger.modbus.addedAt = new Date().toString()
    if(logger.status.pump == 0) {
        loggerData.child('modbus').set(logger.modbus)
    }
    loggerData.child('status').set(logger.status)
})

module.exports = watcher;