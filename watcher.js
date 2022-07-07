const onChange = require('on-change');
const logger = require('./logger');
const db = require('./rtb');

const loggerData = db.child(112233)
const watcher = onChange(logger, () => {
    loggerData.set(logger)
    loggerData.onDisconnect().set('disconnect')
})

module.exports = watcher;