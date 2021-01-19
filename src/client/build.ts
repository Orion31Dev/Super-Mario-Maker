import { Block, BlockType, genBlock } from '../shared/blocks';
import { Level } from '../shared/level';
import { canvas, step, ctx, renderLevel, renderGrid, renderImages, imgQueue } from './canvas';
import { bound, clamp, cx, cy, SCALE, t, TILE, time } from './const';
import { Camera, Entity } from './entity';
import { uploadLevelTemp } from './sockets';

let dt = 0,
  last = 0;

export let selectedBlock = BlockType.Platform;

const coords = document.getElementById('coords') as HTMLElement;

let level = new Level();

let camera = new Camera();
let player = new Entity();
player.width = player.height = TILE * 0.7;

player.x = 4.15 * TILE;
player.y = 13.15 * TILE;
camera.x = player.x;
camera.y = player.y;

let mouseX = 0,
  mouseY = 0;
let realMouseX = 0,
  realMouseY = 0;

let mouseBlockX = 0,
  mouseBlockY = 0;

let mousedown = false;

window.addEventListener('mousemove', (e) => {
  realMouseX = e.clientX;
  realMouseY = e.clientY;
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();

  realMouseX = e.touches[0].pageX;
  realMouseY = e.touches[0].pageY;
});

canvas.addEventListener('mousedown', () => {
  mousedown = true;
});

canvas.addEventListener('touchstart', () => {
  mousedown = true;
});

window.addEventListener('mouseup', () => {
  mousedown = false;
});

window.addEventListener('touchend', () => {
  mousedown = false;
});

const updateMouseCoords = () => {
  let rect = canvas.getBoundingClientRect();
  mouseX = (realMouseX - rect.left) * SCALE + camera.x - camera.hw;
  mouseY = (realMouseY - rect.top) * SCALE + camera.y - camera.hh;
  mouseBlockX = t(mouseX);
  mouseBlockY = t(mouseY);

  mouseBlockX = bound(mouseBlockX, 0, level.sizeX - 1);
  mouseBlockY = bound(mouseBlockY, 0, level.sizeY - 1);

  coords.innerHTML = `(${mouseBlockX}, ${mouseBlockY})`;

  if (mousedown) {
    if (mouseBlockX === t(player.x) && mouseBlockY === t(player.y)) return;
    
    level.rows[mouseBlockY].blocks[mouseBlockX].type = selectedBlock;
  }
};

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
  updateMouseCoords();
  camera.update(dt, level);
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderLevel(level, camera);
  renderImages();

  // Ghost Block (On cursor)
  let style = genBlock(mouseBlockX, mouseBlockY, selectedBlock).getStyle();

  if (mouseBlockX !== t(player.x) || mouseBlockY !== t(player.y)) {
    if (style instanceof HTMLImageElement) {
      imgQueue.push({ img: style, x: cx((mouseBlockX + .5) * TILE, camera), y: cy((mouseBlockY + .5) * TILE, camera), opacity: .5 });
    } else {
      ctx.beginPath();
      ctx.fillStyle = shade(style, -15) + '99'; // 99 alpha (hexadecimal)
      ctx.rect(cx(mouseBlockX * TILE, camera), cy(mouseBlockY * TILE, camera), TILE, TILE);
      ctx.fill();
    }
  } else {
    ctx.beginPath();
    ctx.fillStyle = '#ff333349'; // 99 alpha (hexadecimal)
    ctx.rect(cx(mouseBlockX * TILE, camera), cy(mouseBlockY * TILE, camera), TILE, TILE);
    ctx.fill();
  }

  // Player
  ctx.beginPath();
  ctx.rect(cx(player.x, camera), cy(player.y, camera), player.width, player.height);
  ctx.fillStyle = 'orange';
  ctx.fill();

  renderGrid(level, camera);
};

requestAnimationFrame(frame);

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'd':
      camera.right = true;
      break;
    case 'a':
      camera.left = true;
      break;
    case 's':
      camera.down = true;
      break;
    case 'w':
      camera.up = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'd':
      camera.right = false;
      break;
    case 'a':
      camera.left = false;
      break;
    case 's':
      camera.down = false;
      break;
    case 'w':
      camera.up = false;
      break;
  }
});

// Setup Palette
const palette = document.getElementById('palette') as HTMLElement;
let blockDivs: HTMLElement[] = [];

for (let b in BlockType) {
  /* typescript loops through the enum twice: one with the index, and one with the name
   * for example: 0, 1, 2, Platform, Item, None
   * We only want the index, not the name */
  if (isNaN(Number(b))) break;

  const blockNum = parseInt(b);
  const blockName = BlockType[b];

  let div = document.createElement('div');

  div.classList.add('block', blockName);

  let style = genBlock(0, 0, blockNum).getStyle();

  if (style instanceof HTMLImageElement) div.style.backgroundImage = `url('${style.src}')`;
  else div.style.background = style;

  div.onclick = () => {
    selectedBlock = BlockType[blockName as keyof typeof BlockType]; // yikes
    updateBlockDivs();
  };

  blockDivs.push(div);
  palette.appendChild(div);
}

const updateBlockDivs = () => {
  blockDivs.forEach((d) => {
    if (d.classList.contains(BlockType[selectedBlock].toString())) d.classList.add('selected');
    else d.classList.remove('selected');
  });
};

updateBlockDivs();

function shade(color: string, percent: number) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  // @ts-ignore silly typescript, R G and B can be letters bc base 16
  R = parseInt((R * (100 + percent)) / 100);
  // @ts-ignore
  G = parseInt((G * (100 + percent)) / 100);
  // @ts-ignore
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
}

// Play Button
const play = document.getElementById('play') as HTMLElement;
play.addEventListener('click', () => {
  uploadLevelTemp(level, (code: string) => {
    window.open(window.location.origin + '/play/' + code, 'smm-tmp-play-' + code);
  });
});
