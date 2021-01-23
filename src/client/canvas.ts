import { Level } from '../shared/level';
import { cx, cy, SCALE, TILE } from './const';
import { Camera } from './entity';

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const fps = 60,
  step = 1 / fps;

export let ctx: null | CanvasRenderingContext2D = null;

if (canvas) {
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    canvas.width = window.innerWidth * SCALE;
    canvas.height = window.innerHeight * SCALE;
  }

  resizeCanvas();
}

export const renderLevel = (level: Level, camera: Camera) => {
  if (!ctx) return;

  // Blocks
  for (let x = 0; x < level.sizeX; x++) {
    if ((x + 1) * TILE < camera.x - camera.hw || x * TILE > camera.x + camera.hw) continue; // Don't draw offscreen
    for (let y = 0; y < level.sizeY; y++) {
     if ((y + 1) * TILE < camera.y - camera.hh || y * TILE > camera.y + camera.hh) continue;

      let style = level.at(x, y).getStyle();
      let bkgStyle = level.at(x, y).getBkgStyle();

      if (bkgStyle !== null) {
        ctx.beginPath();
        ctx.rect(cx(x * TILE, camera), cy(y * TILE, camera), TILE, TILE);
        ctx.fillStyle = ctx.strokeStyle = bkgStyle;
        ctx.fill();
        ctx.stroke();
      }

      if (style instanceof HTMLImageElement) {
        imgQueue.push({ img: style, x: cx((x + 0.5) * TILE, camera), y: cy((y + 0.5) * TILE, camera), opacity: 1 });
      } else {
        ctx.beginPath();
        ctx.rect((cx(x * TILE, camera)), cy(y * TILE, camera), TILE, TILE);
        ctx.fillStyle = ctx.strokeStyle = style;
        ctx.fill();
        ctx.stroke();
      }
    }
  }
};

export const renderGrid = (level: Level, camera: Camera) => {
  if (!ctx) return;

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

export let imgQueue: { img: HTMLImageElement; x: number; y: number; opacity: number }[] = [];

export const renderImages = () => {
  imgQueue.forEach((o) => {
    renderImage(o.img, o.x, o.y, TILE, TILE, parseFloat(o.img.style.rotate), o.opacity);
  });

  imgQueue = [];
};

export const renderImage = function (
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  opacity: number
) {
  if (!ctx) return;
  const centerX = width / 2.0;
  const centerY = height / 2.0;

  // save context's current transform state
  ctx.save();

  ctx.globalAlpha = opacity;

  // move context's origin to image position
  ctx.translate(x, y);

  // apply transformations
  ctx.rotate((Math.PI / 180) * angle);

  // draw image centered on its position
  ctx.drawImage(image, -centerX, -centerY, width, height);

  ctx.globalAlpha = 1;

  // restore context's previous transform state
  ctx.restore();
};
