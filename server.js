const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express')
const server = express()
const rest  = require('./rest/index')


const bodyParser = require('body-parser')
server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


app.prepare().then(() => {
  server.post('/api/login', rest.login);
  server.post('/api/user', rest.createUser); //create new user


  server.get('*', (req, res) => handle(req, res))
  server.listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
