
const Datastore = require('nedb')
const users = new Datastore({ filename: './db/users.db', autoload: true });

module.exports = {
    createUser: function(req, res) {
      const user = { _id: req.body.username, password: req.body.password, name: req.body.name, role: req.body.role };
      users.insert(user, function (err, newUser) {
        if(err) return res.send("error happen")
        if(newUser) {
          res.send(newUser)
        } else {
          res.send('nothin to create')
        }
      });
    },
    login: function(req, res) {
      users.findOne({ _id: req.body.username, password: req.body.password }, function (err, user) {
        if(err) return res.send("error happen")
        console.log(user)
        if(user) {
          res.send(user)
        } else {
          res.send('nothin to show')
        }
      });
    }
}
