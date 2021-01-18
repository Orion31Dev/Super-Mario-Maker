import { Level } from '../shared/level';

import express from 'express';
import path from 'path';

const app = express();
const http = require('http').createServer(app);

const io: any = require('socket.io')(http);

app.use(express.static(path.join(__dirname)));

app.get('/', (_req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.get('/build', (_req, res) => {
  res.sendFile('build.html', { root: __dirname });
});

app.get('/play', (_req, res) => {
  res.sendFile('play.html', { root: __dirname });
});

http.listen(process.env.PORT || 3000);

let levels: { [key: string]: Level } = {};
let tempLevels: { [key: string]: Level } = {};

io.on('connect', (socket: any) => {
  socket.on('level-tmp', (msg: Level) => {
    let code = 'tmp-' + generateCode();
    tempLevels[code] = msg;
    socket.emit('level-tmp', code);
  });

  socket.on('req-lvl', (msg: string) => {
    if (levels[msg]) socket.emit('level', levels[msg]);
  });

  socket.on('lvl-exists', (msg: string) => {
    if (levels[msg]) socket.emit('lvl-exists', true);
    else socket.emit('lvl-exists', false);
  });
});

const generateCode = () => {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';

  // 5 = length of room code
  for (var i = 5; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
