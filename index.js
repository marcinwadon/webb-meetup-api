const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const join = require('path').join;

const PORT = process.env.PORT || 80;
const DEBUG = process.env.DEBUG || false;

const models = join(__dirname, 'app/models');
const app = express();

module.exports = app;

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

require('./app/config/express')(app);
require('./app/config/routes')(app);

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen() {
  const server = http.Server(app);

  server.listen(PORT);
  DEBUG && console.log('Server listening on port ' + PORT);
}

function connect() {
  const options = { server: { socketOptions: { keepAlive: 1 } } };

  mongoose.Promise = global.Promise;
  return mongoose.connect('mongodb://mongo:27017', options).connection;
}
