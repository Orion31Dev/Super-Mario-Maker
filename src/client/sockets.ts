import { io } from 'socket.io-client';
import { Level } from '../shared/level';

const socket = io();

export const uploadLevel = (level: Level) => {
  socket.emit('level', level);
};

export const uploadLevelTemp = (level: Level) => {
  socket.emit('level-tmp', level);
};

let getCallback: Function;

export const getLevel = (c: Function) => {
  socket.emit('req-lvl');
  getCallback = c;
};

socket.on('level', (msg: any) => {
  getCallback(Object.assign(new Level(), msg));
});

let checkCallback: Function;

export const levelExists = (code: string, c: Function) => {
  socket.emit('lvl-exists');
  
  checkCallback = c;
};

socket.on('lvl-exists', (msg: boolean) => {
  checkCallback(msg);
});