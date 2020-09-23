const admin = require('firebase-admin');
const corsConfig = require('./cors-config.json');
const cors = require('cors')({ origin: corsConfig.origin });

module.exports = function (req, res) {
  return cors(req, res, () => {
    admin
      .database()
      .ref('roleEventMapping')
      .once('value')
      .then(snapshot => {
        res.status(200).send(snapshot.val());
      })
      .catch(error => {
        res.status(400).send({ error: 'Role events not found' });
      });
  });
};