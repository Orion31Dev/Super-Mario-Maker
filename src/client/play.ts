import { Level } from '../shared/level';
import { canvas, step, ctx, renderLevel, renderImages } from './canvas';
import { animateFlexContainers, cx, cy, DEBUG_DRAW_COLLISION_TRACERS, TILE, time } from './const';
import { Camera, Entity, flushDebugDrawQueues } from './entity';
import { getLevel, levelExists, saveLevel } from './sockets';

const endScreen = document.querySelector('.cont-end') as HTMLElement;
const invalidScreen = document.querySelector('.cont-inval') as HTMLElement;
const winScreen = document.querySelector('.cont-win') as HTMLElement;
const loadingScreen = document.querySelector('.cont-loading') as HTMLElement;

const uploadButton = document.querySelector('.btn-upload') as HTMLElement;
uploadButton.onclick = () => {
  if (code.startsWith('tmp-')) {
    saveLevel(code, (code: string) => {
      uploadButton.innerHTML = 'Uploaded as ' + code;
      uploadButton.onclick = () => {
        window.open('/play/' + code, '_blank');
      };
    });
  }
};

let dt = 0,
  last = 0;

let firstLoad = true;

const code = window.location.href.split('/')[window.location.href.split('/').length - 1];

(document.getElementById('code') as HTMLElement).innerHTML = code;

if (!code.startsWith('tmp-')) uploadButton.style.visibility = 'hidden';

let camera = new Camera();
let player = new Entity();

let playing = false;
let level = new Level();

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
  renderImages();

  // Player
  ctx.beginPath();
  ctx.rect(cx(player.x, camera), cy(player.y, camera), player.width, player.height);
  ctx.fillStyle = 'orange';
  ctx.fill();

  if (DEBUG_DRAW_COLLISION_TRACERS) flushDebugDrawQueues(camera);
};

const endGame = () => {
  playing = false;

  animateFlexContainers();

  endScreen.classList.add('active');
};

const resetGame = () => {
  camera = new Camera();
  player = new Entity();

  player.x = 4.15 * TILE;
  player.y = 13.15 * TILE;
  player.width = player.height = TILE * 0.7;

  camera.x = player.x;
  camera.y = player.y;

  // Check if level exists
  levelExists(code, (b: boolean) => {
    if (!b) {
      invalidScreen.classList.add('active');
      animateFlexContainers();
    } else {
      playing = true;
      if (firstLoad) {
        loadingScreen.style.transform = 'translateY(-100%);';
        setTimeout(() => loadingScreen.style.visibility = 'hidden', 500);
      }
    }
  });

  // Load level
  getLevel(code, (l: Level) => {
    level = l;
  });

  endScreen.classList.remove('active');
  winScreen.classList.remove('active');
};

document.querySelectorAll('#restart, .btn-restart').forEach((b) => b.addEventListener('click', resetGame));

const winGame = () => {
  playing = false;
  winScreen.classList.add('active');
  animateFlexContainers();
};
player.onWin = winGame;

resetGame();
requestAnimationFrame(frame); // start first frame

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
