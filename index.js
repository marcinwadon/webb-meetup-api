const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// CONSTANTS
const PORT = process.env.PORT || 80;
const DEBUG = process.env.DEBUG || false;

// APP INIT
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTER
const router = express.Router();

router.get('/', (req, res) => {
  res.json({message: 'hooray!' });
});

router.get('/schedule', (req, res) => {
  res.json(JSON.parse(fs.readFileSync('mocks/schedule.json', 'utf-8')));
});

router.get('/map', (req, res) => {
  res.json(JSON.parse(fs.readFileSync('mocks/map.json', 'utf-8')));
});

router.get('/speakers', (req, res) => {
  res.json(JSON.parse(fs.readFileSync('mocks/speakers.json', 'utf-8')));
});

app.use('/api', router);

// IO SERVER

const server = http.Server(app);
const io = require('socket.io')(server);

server.listen(PORT);
DEBUG && console.log('Server listening on port ' + PORT);

// IO

io.sockets.on(
  'connection',
  (socket) => {
    const socketId = socket.id;
    DEBUG && console.log('Socket connected.', socketId);

    // REAL-TIME IO HERE

    socket.on(
      'disconnect',
      () => {
        DEBUG && console.log('Socket disconnected.', socketId);
      }
    );
  }
)
