
const Datastore = require('nedb')
const users = new Datastore({ filename: './db/users.db', autoload: true });
const channels = new Datastore({ filename: './db/channels.db', autoload: true });
const { parse } = require('url')


module.exports = {
    loginStrategy : function(username, password, done) {
      console.log('here', username, password)

        users.findOne({ _id: username, password: password }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          return done(null, user);
        });
    },
    handleRoute: function(req, res, handle) {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
      const restrictedPages = ['/list', '/new', '/detail']
      if(req.isAuthenticated()) {
          handle(req, res)
      } else if(restrictedPages.includes(pathname)) {
          res.redirect(`/`);
      } else {
          handle(req, res)
      }
    },
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
        if(user) {
          res.send({ username: user._id, role: user.role, name: user.name })
        } else {
          res.send('nothin to show')
        }
      });
    },
    getRootChannelList: function(req, res) {
      channels.find({ }, function (err, roots) {
        if(err) return res.send("error happen")
        if(roots) {
          res.send(roots)
        } else {
          res.send('nor roots found')
        }
      });
    },
    createChannelRoot: function(req, res) {
      const newRoot = { _id: req.body.root };
      channels.insert(newRoot, function (err, newChannel) {
        if(err) return res.send("error happen")
        if(newChannel) {
          res.send(newChannel)
        } else {
          res.send('no channel root saved')
        }
      });
    }
}
