import { Block } from '../shared/blocks';
import { DEBUG_DRAW_COLLISION_TRACERS, TILE } from './const';
import { aabbQueue, rayQueue } from './entity';

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

// A ray is defined by its origin and direction.
export class Ray {
  origin: { x: number; y: number };
  direction: Direction;
  constructor(x: number, y: number, dir: Direction) {
    this.origin = { x: x, y: y };
    this.direction = dir;
    if (DEBUG_DRAW_COLLISION_TRACERS) rayQueue.push(this);
  }
}

// AABB is defined by its top-left corner, width and height.
export class AABB {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

function compareInterval(value: number, low: number, high: number) {
  // This shouldn't necessarily be required, but it allows us to just specify
  // the bounds of an interval, without checking which of the two is low and which is high.
  if (low > high) {
    var tmp = high;
    high = low;
    low = tmp;
  }

  // And then we simply check if the value lies outside of the interval
  if (value < low) {
    return -1;
  } else if (low <= value && value <= high) {
    return 0;
  } else if (value > high) {
    return 1;
  }
}

function intersect(ray: Ray, aabb: AABB) {
  switch (ray.direction) {
    case Direction.UP:
      if (ray.origin.y >= aabb.y + aabb.h) {
        if (compareInterval(ray.origin.x, aabb.x, aabb.x + aabb.w) == 0) {
          if (DEBUG_DRAW_COLLISION_TRACERS) aabbQueue.push(aabb);
          return { x: ray.origin.x, y: aabb.y + aabb.h };
        } else {
          return null;
        }
      } else {
        return null;
      }
    case Direction.DOWN:
      if (ray.origin.y <= aabb.y) {
        if (compareInterval(ray.origin.x, aabb.x, aabb.x + aabb.w) == 0) {
          if (DEBUG_DRAW_COLLISION_TRACERS) aabbQueue.push(aabb);
          return { x: ray.origin.x, y: aabb.y };
        } else {
          return null;
        }
      } else {
        return null;
      }
    case Direction.LEFT:
      if (ray.origin.x >= aabb.x + aabb.w) {
        if (compareInterval(ray.origin.y, aabb.y, aabb.y + aabb.h) == 0) {
          if (DEBUG_DRAW_COLLISION_TRACERS) aabbQueue.push(aabb);
          return { x: aabb.x + aabb.w, y: ray.origin.y };
        } else {
          return null;
        }
      } else {
        return null;
      }
    case Direction.RIGHT:
      if (ray.origin.x <= aabb.x) {
        if (compareInterval(ray.origin.y, aabb.y, aabb.y + aabb.h) == 0) {
          if (DEBUG_DRAW_COLLISION_TRACERS) aabbQueue.push(aabb);
          return { x: aabb.x, y: ray.origin.y };
        } else {
          return null;
        }
      } else {
        return null;
      }
  }
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function raycast(ray: Ray, colliders: Block[]) {
  var collisions = colliders
    .map(function (block) {
      let aabb = new AABB(block.x * TILE, block.y * TILE, TILE, TILE);
      var result = {
        collider: aabb,
        intersection: intersect(ray, aabb),
        distance: 0,
      };

      if (result.intersection) {
        result.distance = distance(ray.origin, result.intersection);
      }

      return result;
    })
    .filter(function (collision) {
      return collision.intersection;
    });

  collisions.sort(function (c1, c2) {
    return c1.distance - c2.distance;
  });

  return collisions[0];
}