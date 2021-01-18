import { BlockType } from '../shared/blocks';
import { Level } from '../shared/level';
import { canvas, step, ctx, renderLevel, renderGrid } from './canvas';
import { DEBUG_DRAW_COLLISION_TRACERS, SCALE, TILE, time } from './const';
import { Camera, Entity, flushDebugDrawQueues } from './entity';
import { getLevel } from './sockets';

let dt = 0,
  last = 0;

let level = new Level();
getLevel((l: Level) => {
  level = l;
});

let camera = new Camera();
let player = new Entity();

player.x = 4 * TILE;
player.y = 22 * TILE;
camera.x = player.x;
camera.y = player.y;

const frame = () => {
  const now = time();
  dt = dt + Math.min(1, (now - last) / 1000); // Deltatime
  while (dt > step) {
    dt = dt - step;
    update(step);
  }
  render();
  last = now;

  requestAnimationFrame(frame);
};

const update = (dt: number) => {
  camera.updateAndFollow(dt, level, player);
  player.update(dt, level);
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderLevel(level, camera);

  // Player
  ctx.beginPath();
  ctx.rect(cx(player.x), cy(player.y), TILE, TILE);
  ctx.fillStyle = 'orange';
  ctx.fill();

  //renderGrid(level, camera);
  if (DEBUG_DRAW_COLLISION_TRACERS) flushDebugDrawQueues(camera);
};

requestAnimationFrame(frame);

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
