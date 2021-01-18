import { Level, MAP } from '../shared/level';
import { cx, cy, SCALE, TILE } from './const';
import { Camera } from './entity';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const fps = 60,
  step = 1 / fps,
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth * SCALE;
  canvas.height = window.innerHeight * SCALE;
}

resizeCanvas();

export const width = MAP.w * TILE,
  height = MAP.h * TILE;

export const renderLevel = (level: Level, camera: Camera) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Blocks
  for (let x = 0; x < level.sizeX; x++) {
    if ((x + 1) * TILE < camera.x - camera.hw || x * TILE > camera.x + camera.hw) continue; // Don't draw offscreen
    for (let y = 0; y < level.sizeY; y++) {
      if ((y + 1) * TILE < camera.y - camera.hh || y * TILE > camera.y + camera.hh) continue;

      let style = level.at(x, y).getStyle();

      if (style instanceof HTMLImageElement) {
        ctx.drawImage(style, cx(x * TILE, camera), cy(y * TILE, camera), TILE, TILE);
      } else {
        ctx.beginPath();
        ctx.rect(cx(x * TILE, camera), cy(y * TILE, camera), TILE, TILE);
        ctx.fillStyle = ctx.strokeStyle = style;
        ctx.fill();
        ctx.stroke();
      }
    }
  }
};

export const renderGrid = (level: Level, camera: Camera) => {
  ctx.strokeStyle = 'rgba(0, 0, 0, .25)';
  ctx.lineWidth = 1 * SCALE;

  for (let x = 0; x < level.sizeX; x++) {
    if ((x + 1) * TILE < camera.x - camera.hw || x * TILE > camera.x + camera.hw) continue; // Don't draw offscreen
    for (let y = 0; y < level.sizeY; y++) {
      if ((y + 1) * TILE < camera.y - camera.hh || y * TILE > camera.y + camera.hh) continue;
      ctx.beginPath();
      ctx.rect(cx(x * TILE, camera), cy(y * TILE, camera), TILE, TILE);
      ctx.stroke();
    }
  }
};
