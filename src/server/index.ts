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

app.get(['/build', '/play'], (req, res, next) => {
  if (!req.url.endsWith('/')) res.redirect(301, req.url + '/'); // Require trailing slash
  next();
});

app.get('/build/*', (_req, res) => {
  res.sendFile('build.html', { root: __dirname });
});

app.get('/play/*', (_req, res) => {
  res.sendFile('play.html', { root: __dirname });
});

http.listen(process.env.PORT || 3000);

let levels: { [key: string]: Level } = {};
let tempLevels: { [key: string]: Level } = {};

let socketTempCodes: string[] = [];

io.on('connect', (socket: any) => {
  socket.on('level-tmp', (msg: Level) => {
    let code = '';
    if (socketTempCodes[socket.id]) code = socketTempCodes[socket.id];
    else code = 'tmp-' + generateCode();

    console.log(code);

    tempLevels[code] = msg;
    socket.emit('level-tmp', code);

    socketTempCodes[socket.id] = code;
  });

  socket.on('req-lvl', (msg: string) => {
    if (msg.startsWith('tmp') && tempLevels[msg]) socket.emit('level', tempLevels[msg]);
    if (levels[msg]) socket.emit('level', levels[msg]);
  });

  socket.on('lvl-exists', (msg: string) => {
    let bool = (msg.startsWith('tmp') && tempLevels[msg]) || levels[msg] ? true : false;
    console.log(msg + ' ' + bool);

    if (msg.startsWith('tmp') && tempLevels[msg]) socket.emit('lvl-exists', true);
    else if (levels[msg]) socket.emit('lvl-exists', true);
    else socket.emit('lvl-exists', false);
  });
});

const generateCode = () => {
  let result = '';

  do {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // 5 = length of room code
    for (var i = 5; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  } while (levels[result]);

  return result;
};
