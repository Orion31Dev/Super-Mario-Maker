import { BlockType } from '../shared/blocks';
import { Level } from '../shared/level';
import { canvas, step, ctx, renderLevel, renderGrid } from './canvas';
import { animateFlexContainers, DEBUG_DRAW_COLLISION_TRACERS, TILE, time } from './const';
import { Camera, Entity, flushDebugDrawQueues } from './entity';
import { getLevel, levelExists } from './sockets';

const endScreen = document.querySelector('.cont-end') as HTMLElement;
const invalidScreen = document.querySelector('.cont-inval') as HTMLElement;

let dt = 0,
  last = 0;

const code = window.location.href.split('/')[window.location.href.split('/').length - 1];

(document.getElementById('code') as HTMLElement).innerHTML = code;

levelExists(code, (b: boolean) => {
  if (!b) {
    invalidScreen.classList.add('active');
    animateFlexContainers();
  }
  else playing = true;
});

let level = new Level();
getLevel(code, (l: Level) => {
  level = l;
});

let camera = new Camera();
let player = new Entity();

player.width = player.height = TILE * .7;

let playing = false;

player.x = 4 * TILE;
player.y = 14 * TILE;
camera.x = player.x;
camera.y = player.y;

const frame = () => {
  const now = time();

  if (playing) {
    dt = dt + Math.min(1, (now - last) / 1000); // Deltatime
    while (dt > step) {
      dt = dt - step;
      update(step);
    }
    render();
  }

  last = now;

  requestAnimationFrame(frame);
};

const update = (dt: number) => {
  camera.updateAndFollow(dt, level, player);
  player.update(dt, level);

  if (player.y > (level.sizeY + 4) * TILE) endGame();
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderLevel(level, camera);

  // Player
  ctx.beginPath();
  ctx.rect(cx(player.x), cy(player.y), player.width, player.height);
  ctx.fillStyle = 'orange';
  ctx.fill();

  //renderGrid(level, camera);
  if (DEBUG_DRAW_COLLISION_TRACERS) flushDebugDrawQueues(camera);
};

const endGame = () => {
  endScreen.style.visibility = 'visible';
  playing = false;

  animateFlexContainers();
};

requestAnimationFrame(frame); // start first frame

const cx = (x: number) => {
  return x - camera.x + camera.hw;
};

const cy = (y: number) => {
  return y - camera.y + camera.hh;
};

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'd':
      player.right = true;
      break;
    case 'a':
      player.left = true;
      break;
    case ' ':
      player.jump();
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'd':
      player.right = false;
      break;
    case 'a':
      player.left = false;
      break;
  }
});
