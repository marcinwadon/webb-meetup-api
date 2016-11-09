const express = require('express');

const map = require('../controllers/map');
const users = require('../controllers/users');
const speakers = require('../controllers/speakers');
const sessions = require('../controllers/sessions');

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
    .get('/', auth.requiresLogin, auth.requiresRole(['ROLE_USER', 'ROLE_SPEAKER', 'ROLE_ADMIN']), users.list)
    .post('/changePassword/:userId', auth.requiresLogin, users.changePassword)
    .get('/:userId', auth.requiresLogin, auth.requiresRole(['ROLE_USER', 'ROLE_SPEAKER', 'ROLE_ADMIN']), users.list)
  app.use('/api/user', userRouter);

  const speakerRouter = express.Router();
  speakerRouter
    .param('speakerId', speakers.load)
    .get('/', speakers.list)
    .get('/:speakerId', speakers.list);
  app.use('/api/speaker', speakerRouter);

  const sessionsRouter = express.Router();
  sessionsRouter
    .param('sessionId', sessions.load)
    .get('/', sessions.list)
    .get('/:sessionId', sessions.list);
  app.use('/api/session', sessionsRouter);
}
