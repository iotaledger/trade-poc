const admin = require('firebase-admin');
const corsConfig = require('./cors-config.json');
const cors = require('cors')({ origin: corsConfig.origin });

module.exports = function (req, res) {
  return cors(req, res, () => {
    if (!req.query.containerId) {
      return res.send({ error: 'No containerId Provided' });
    }

    admin
      .database()
      .ref(`items/${req.query.containerId}`)
      .update(req.body)
      .then(() => {
        res.status(200).send("ok");
      })
      .catch(() => {
        return res.status(500).send({ error: 'containerId not found' });
      });
  });
};