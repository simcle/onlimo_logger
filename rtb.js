const admin = require('firebase-admin');
const serviceAccount = require('./service.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://onlimo-ba6e3-default-rtdb.asia-southeast1.firebasedatabase.app'
})
const db = admin.database()
const ref = db.ref('dlhJabar')
module.exports = ref;