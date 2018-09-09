const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express')
const server = express()
const rest  = require('./rest/index')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const session =  require('express-session')
const bodyParser = require('body-parser')

server.use(session({ secret: "cats" }));
server.use(passport.initialize());
server.use(passport.session());

server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
  rest.loginStrategy
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, {_id: user._id, name: user.name, role: user.role});
});

app.prepare().then(() => {
  server.post('/api/login', passport.authenticate('local'), rest.login);
  server.post('/api/user', rest.createUser); //create new user
  server.get('/api/channel', rest.getRootChannelList);
  server.post('/api/channel', rest.createChannelRoot);

  server.get('*', (req, res) => rest.handleRoute(req, res, handle))
  server.listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
