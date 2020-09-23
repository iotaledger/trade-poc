const admin = require('firebase-admin');
const corsConfig = require('./cors-config.json');
const cors = require('cors')({ origin: corsConfig.origin });

module.exports = function (req, res) {
  return cors(req, res, () => {
    if (!req.query.role) {
      res.status(400).send({ error: 'No role Provided' });
    } else {
      admin
        .database()
        .ref(`roleEventMapping/${req.query.role}`)
        .once('value')
        .then(snapshot => {
          res.status(200).send(snapshot.val());
        })
        .catch(error => {
          res.status(400).send({ error: 'Role events not found' });
        });
    }
  });
};