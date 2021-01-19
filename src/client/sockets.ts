import { io } from 'socket.io-client';
import { Level } from '../shared/level';

const socket = io();

let saveCallback: Function;

export const saveLevel = (code: string, c: Function) => {
  socket.emit('save-level', code);
  saveCallback = c;
};

socket.on('save-level', (msg: string) => {
  if (saveCallback) saveCallback(msg);
});

let levelTempCallback: Function;

export const uploadLevelTemp = (level: Level, c: Function) => {
  socket.emit('level-tmp', level);
  levelTempCallback = c;
};

socket.on('level-tmp', (msg: string) => {
  if (levelTempCallback) levelTempCallback(msg);
});

let getCallback: Function;

export const getLevel = (code: string, c: Function) => {
  socket.emit('req-lvl', code);
  getCallback = c;
};

socket.on('level', (msg: any) => {
  if (getCallback) getCallback(Object.assign(new Level(), msg));
});

let checkCallback: Function;

export const levelExists = (code: string, c: Function) => {
  socket.emit('lvl-exists', code);

  checkCallback = c;
};

socket.on('lvl-exists', (msg: boolean) => {
  if (checkCallback) checkCallback(msg);
});
