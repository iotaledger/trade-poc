const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

module.exports = function(req, res) {
  return cors(req, res, () => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({ error: 'Bad Input' });
    }

    let response = {};

    // Retrieve user data
    admin
      .database()
      .ref(`users/${username}`)
      .once('value')
      .then(snapshot => {
        const val = snapshot.val();
        if (val.password === password) {
          delete val.password;
          val.userId = username;
          return res.send(val);
          // Retrieve MAM data
          // admin
          //   .database()
          //   .ref('mam')
          //   .once('value')
          //   .then(snapshot => {
          //     response = Object.assign({}, response, { mam: snapshot.val(), role: username });
          //     return res.send(response);
          //   })
          //   .catch(error => {
          //     return res.status(500).send({ error: 'MAM data not found' });
          //   });
        } else {
          return res.status(403).send({ error: 'Wrong password' });
        }
      })
      .catch(error => {
        return res.status(500).send({ error: 'User not found' });
      });
  });
};
