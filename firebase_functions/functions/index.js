const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./service_account.json');
const login = require('./login');
const itemCreate = require('./itemCreate');
const itemUpdate = require('./itemUpdate');
const itemGet = require('./itemGet');
const itemsGet = require('./itemsGet');
const eventGet = require('./eventGet');
const eventsGet = require('./eventsGet');
const settingsGet = require('./settingsGet.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://item-tracking.firebaseio.com',
});

exports.login = functions.https.onRequest(login);
exports.itemCreate = functions.https.onRequest(itemCreate);
exports.itemUpdate = functions.https.onRequest(itemUpdate);
exports.itemGet = functions.https.onRequest(itemGet);
exports.itemsGet = functions.https.onRequest(itemsGet);
exports.eventGet = functions.https.onRequest(eventGet);
exports.eventsGet = functions.https.onRequest(eventsGet);
exports.settingsGet = functions.https.onRequest(settingsGet);
