const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

module.exports = function(req, res) {
  return cors(req, res, () => {
    const { username } = req.body;
    let response = {};

    // Retrieve user data
    admin
      .database()
      .ref(`users/${username}`)
      .once('value')
      .then(snapshot => {
        const val = snapshot.val();
        val.userId = username;
        return res.send(val);
      })
      .catch(error => {
        return res.status(500).send({ error: 'User not found' });
      });
  });
};
