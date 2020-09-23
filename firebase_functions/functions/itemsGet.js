const admin = require('firebase-admin');
const corsConfig = require('./cors-config.json');
const cors = require('cors')({ origin: corsConfig.origin });

module.exports = function (req, res) {
  return cors(req, res, () => {
    if (req.query.status) {
      admin
        .database()
        .ref('items')
        .orderByChild('status')
        .equalTo(req.query.status)
        .once('value')
        .then(snapshot => {
          res.status(200).send(snapshot.val());
        })
        .catch(error => {
          res.status(400).send({ error: 'Containers not found', details: error });
        });
    } else {
      admin
        .database()
        .ref('items')
        .once('value')
        .then(snapshot => {
          res.status(200).send(snapshot.val());
        })
        .catch(error => {
          res.status(400).send({ error: 'Containers not found', details: error });
        });
    }
  });
};