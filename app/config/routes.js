const express = require('express');

const map = require('../controllers/map');
const users = require('../controllers/users');
const speakers = require('../controllers/speakers');
const sessions = require('../controllers/sessions');
const threads = require('../controllers/threads');
const messages = require('../controllers/messages');

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
    .get('/', auth.requiresLogin, auth.requiresRole(['ROLE_ADMIN']), users.list)
    .get('/me', auth.requiresLogin, users.me)
    .post('/changePassword', auth.requiresLogin, users.changePassword)
    .get('/:userId', auth.requiresLogin, users.list)
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
    .get('/:sessionId', sessions.list)
    .get('/:sessionId/thread', auth.couldLogin, threads.list)
    .post('/:sessionId/message', auth.requiresLogin, messages.create);
  app.use('/api/session', sessionsRouter);

  const threadsRouter = express.Router();
  threadsRouter
    .delete('/:threadId', auth.requiresLogin, auth.requiresRole(['ROLE_ADMIN']), threads.load, threads.delete)
    .get('/:threadId/message', auth.couldLogin, threads.load, messages.list)
    .post('/:threadId/message', auth.requiresLogin, threads.load, messages.add);
  app.use('/api/thread', threadsRouter);
}
