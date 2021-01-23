import { MAP } from '../shared/level';
import { Camera, Entity } from './entity';

export const DEBUG_DRAW_COLLISION_TRACERS = false;

export const SCALE = 3;
export const TILE = Math.round(Math.max(window.innerWidth / 30, window.innerHeight / 15) * SCALE);

export const GRAVITY = 0.5 * TILE, // default gravity
  MAXDX = 5 * TILE,
  MAXDY = 15 * TILE,
  ACCEL = TILE / 2,
  FRICTION = TILE,
  IMPULSE = 15 * TILE; // default player jump impulse

export let width: number, height: number;
width = height = 0;

export const updateDimensions = () => {
  width = MAP.w * TILE;
  height = MAP.h * TILE;
};

export let blockActivationQueue: { x: number; y: number }[] = [];

// Avoid importing entity, which imports canvas, which will crash in index.html
export let entities: Entity[] = [];
export let entityDeletionQueue: { x: number, y: number }[] = [];

export const setEntities = (newEntities: Entity[]) => {
  entities = newEntities;
}

export const resetBlockActivationQueue = () => {
  blockActivationQueue = [];
};

export const time = () => {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
};

// Abs X to Camera X
export const cx = (x: number, camera: Camera) => {
  return x - camera.x + camera.hw;
};

// Abs Y to Camera Y
export const cy = (y: number, camera: Camera) => {
  return y - camera.y + camera.hh;
};

// Tile Pos from Abs Pos
export const t = (pos: number) => {
  return Math.floor(pos / TILE);
};

export const clamp = (num: number, max: number) => {
  if (Math.abs(num) > max) return max * Math.sign(num);
  return num;
};

export const bound = (num: number, min: number, max: number) => {
  if (num > max) return max;
  if (num < min) return min;

  return num;
};

export const animateFlexContainers = () => {
  document.querySelectorAll('button, input').forEach((b) => {
    b.animate(
      [
        {
          transform: 'translateX(-1000%)',
        },
        {
          transform: 'translateX(0)',
        },
      ],
      {
        duration: 500,
        easing: 'ease-out',
        iterations: 1,
        delay: 0.5,
        fill: 'forwards',
      }
    );
  });

  document.querySelectorAll('.title').forEach((t) => {
    t.animate(
      [
        {
          transform: 'scale(0)',
        },
        {
          transform: 'scale(1)',
        }, // .5s ease-out grow 0s 1
      ],
      {
        duration: 500,
        easing: 'ease-out',
        iterations: 1,
        fill: 'forwards',
      }
    );
  });
};
