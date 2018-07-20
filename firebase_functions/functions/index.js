const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./service_account.json');
const login = require('./login');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://item-tracking.firebaseio.com',
});

exports.login = functions.https.onRequest(login);
