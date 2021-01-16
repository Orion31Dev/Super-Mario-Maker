import { Level } from "../shared/level";

import express from 'express';
import path from "path";

const app = express();
const http = require('http').createServer(app);

const io: any = require('socket.io')(http);   

app.use(express.static(path.join(__dirname)));

app.get('/build', (_req, res) => {
  res.sendFile('build.html', { root: __dirname });
});

app.get('/play', (_req, res) => {
  res.sendFile('play.html', { root: __dirname });
});

http.listen(process.env.PORT || 3000);

let level: Level;
io.on('connect', (socket: any) => {
  socket.on('level-tmp', (msg: Level) => {
    level = msg;
  });

  socket.on('req-lvl', () => {
    socket.emit('level', level);
  });
});