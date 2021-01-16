import { io } from 'socket.io-client';
import { Level } from '../shared/level';

const socket = io();

export const uploadLevel = (level: Level) => {
  socket.emit('level', level);
};

export const uploadLevelTemp = (level: Level) => {
  socket.emit('level-tmp', level);
};  

let callback: Function;
export const getLevel = (c: Function) => {
  socket.emit('req-lvl');
  callback = c;
};

socket.on('level', (msg: any) => {
  callback(Object.assign(new Level(), msg));
});
