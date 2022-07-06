const db = require('./config');

function migration () {
    db.serialize(function () {
        let sql = `CREATE TABLE IF NOT EXISTS logger(
            ph REAL,
            do REAL,
            cond REAL,
            turb REAL,
            temp REAL,
            salt REAL,
            dept REAL,
            addedAt NUMERIC
        );`;
        db.run(sql)
    })
} 

module.exports = migration