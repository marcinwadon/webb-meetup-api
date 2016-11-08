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

  const authRouter = express.Router();
  authRouter
    .post('/register', users.register)
    .post('/login', users.login);
  app.use('/api/auth', authRouter);

  const userRouter = express.Router();  
  userRouter
    .param('userId', users.load)
    .get('/', auth.requiresLogin, auth.requiresRole(['ROLE_USER']), users.list)
    .get('/:userId', auth.requiresLogin, auth.requiresRole(['ROLE_USER']), users.list)
  app.use('/api/user', userRouter);
}
