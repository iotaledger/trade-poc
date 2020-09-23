const admin = require('firebase-admin');
const corsConfig = require('./cors-config.json');
const cors = require('cors')({ origin: corsConfig.origin });

module.exports = function (req, res) {
  return cors(req, res, () => {
    if (!req.query.containerId) {
      return res.status(400).send({ error: 'No containerId Provided' });
    } else {
      admin
        .database()
        .ref(`items/${req.query.containerId}`)
        .set(req.body)
        .then(() => {
          res.status(200).send("ok");
        })
        .catch(() => {
          return res.status(400).send({ error: 'containerId not found' });
        });
    }
  });
};