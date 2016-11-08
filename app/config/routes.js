const express = require('express');

const map = require('../controllers/map');
const users = require('../controllers/users');

const auth = require('./middlewares/authorization');

module.exports = function (app, passport) {
  const mapRouter = express.Router();
  mapRouter
    .get('/', map.list)
    .post('/', map.create);
  app.use('/api/map', mapRouter);

  const userRouter = express.Router();  
  userRouter
    .param('userId', users.load)
    .get('/', auth.requiresLogin, users.list)
    .get('/:userId', users.list)
    .post('/register', users.register)
    .post('/login', users.login);
  app.use('/api/user', userRouter);
}
