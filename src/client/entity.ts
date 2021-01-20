import { isForOfStatement } from 'typescript';
import { BlockType } from '../shared/blocks';
import { Level } from '../shared/level';
import { canvas, ctx, height, width } from './canvas';
import { AABB, Direction, Ray, raycast } from './collision';
import { ACCEL, clamp, cx, cy, DEBUG_DRAW_COLLISION_TRACERS, FRICTION, GRAVITY, IMPULSE, MAXDX, MAXDY, t, TILE } from './const';

export class Entity {
  x: number;
  y: number;
  dx: number;
  dy: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  accel: number;
  friction: number;
  maxdx: number;
  maxdy: number;
  width: number;
  height: number;
  omnipotent: boolean; // subject to collision and gravity
  onGround: boolean;
  onWin: Function | null;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.accel = ACCEL;
    this.friction = FRICTION;
    this.maxdx = MAXDX;
    this.maxdy = MAXDY;
    this.omnipotent = false;
    this.onGround = false;

    this.width = TILE;
    this.height = TILE;

    this.onWin = null;
  }

  update(dt: number, level: Level) {
    let ddx = this.dx,
      ddy = this.dy + (this.omnipotent ? 0 : GRAVITY);

    let movingRight = ddx > 0,
      movingLeft = ddx < 0;

    if (this.right) ddx += this.accel * (this.onGround ? 1 : 0.7);
    else if (movingRight) {
      ddx -= this.friction;
      if (ddx < 0) ddx = 0; // Prevent Friction from starting Entity moving the wrong way
    }

    if (this.left) ddx -= this.accel * (this.onGround ? 1 : 0.7);
    else if (movingLeft) {
      ddx += this.friction;
      if (ddx > 0) ddx = 0; // Prevent Friction from starting Entity moving the wrong way
    }

    if (this.omnipotent) {
      let movingDown = ddy > 0,
        movingUp = ddy < 0;

      if (this.down) ddy += this.accel;
      else if (movingDown) {
        ddy -= this.friction;
        if (ddy < 0) ddy = 0; // Prevent Friction from starting Entity moving the wrong way
      }

      if (this.up) ddy -= this.accel;
      else if (movingUp) {
        ddy += this.friction;
        if (ddy > 0) ddy = 0; // Prevent Friction from starting Entity moving the wrong way
      }
    }

    ddx = clamp(ddx, this.maxdx);
    ddy = clamp(ddy, this.maxdy);

    // Control for deltatime when changing axis
    // We don't want this in cases of collsions, because the Entity will travel the exact distance to the collision
    let xDt = true,
      yDt = true;

    if (!this.omnipotent) {
      let distances = this.getCollisions(level);

      let xs = Math.sign(ddx);
      let ys = Math.sign(ddy);

      this.onGround = distances.bottom < 0.1 && this.dy !== -IMPULSE;

      if (xs > 0) {
        if (Math.abs(ddx * dt) > distances.right) {
          xDt = false;
          ddx = distances.right * xs;
        }
      } else {
        if (Math.abs(ddx * dt) > distances.left) {
          xDt = false;
          ddx = distances.left * xs;
        }
      }

      if (distances.top === 0) {
        // Erase upward moment if hitting ceiling
        ddy = distances.bottom > 0.1 ? GRAVITY : 0;
      } else if (ys > 0) {
        if (Math.abs(ddy * dt) > distances.bottom) {
          yDt = false;
          ddy = distances.bottom * ys;
        }
      } else {
        if (Math.abs(ddy * dt) > distances.top) {
          yDt = false;
          ddy = distances.top * ys;
        }
      }
    }

    if (this.onGround && ddy > 0) ddy = 0; // Prevent Gravity from accumulating

    this.dx = ddx;
    this.dy = ddy;

    this.x += ddx * (xDt ? dt : 1);
    this.y += ddy * (yDt ? dt : 1);
  }

  jump() {
    if (!this.onGround) return;
    this.dy = -IMPULSE;
  }

  getCollisions(level: Level) {
    var off = 0.001;

    var leftRays = [
      new Ray(this.x, this.y + off, Direction.LEFT), // top left
      new Ray(this.x, this.y + this.height - off, Direction.LEFT), // bottom left
    ];
    var topRays = [
      new Ray(this.x + off, this.y, Direction.UP), // top left
      new Ray(this.x + this.width - off, this.y, Direction.UP), // top right
    ];
    var rightRays = [
      new Ray(this.x + this.width, this.y + off, Direction.RIGHT), // top right
      new Ray(this.x + this.width, this.y + this.height - off, Direction.RIGHT), // bottom right
    ];
    var bottomRays = [
      new Ray(this.x + off, this.y + this.height, Direction.DOWN), // bottom left
      new Ray(this.x + this.width - off, this.y + this.height, Direction.DOWN), // bottom right
    ];

    // prettier-ignore
    let neighbors = [
      level.at(t(this.x) - 1, t(this.y) - 1),
      level.at(t(this.x),     t(this.y) - 1),
      level.at(t(this.x) + 1, t(this.y) - 1),
      level.at(t(this.x) + 2, t(this.y) - 1),
      level.at(t(this.x) - 1, t(this.y)),
      level.at(t(this.x),     t(this.y)),
      level.at(t(this.x) + 1, t(this.y)),
      level.at(t(this.x) + 2, t(this.y)),
      level.at(t(this.x) - 1, t(this.y) + 1),
      level.at(t(this.x),     t(this.y) + 1),
      level.at(t(this.x) + 1, t(this.y) + 1),
      level.at(t(this.x) + 2, t(this.y) + 1),
      level.at(t(this.x) - 1, t(this.y) + 2),
      level.at(t(this.x),     t(this.y) + 2),
      level.at(t(this.x) + 1, t(this.y) + 2),
      level.at(t(this.x) + 2, t(this.y) + 2),
    ];

    let barriers = neighbors.filter((b) => {
      return !b.passable();
    });

    let collisions = {
      left: leftRays.map((r) => raycast(r, barriers)).filter((r) => r),
      right: rightRays.map((r) => raycast(r, barriers)).filter((r) => r),
      top: topRays.map((r) => raycast(r, barriers)).filter((r) => r),
      bottom: bottomRays.map((r) => raycast(r, barriers)).filter((r) => r),
    };

    let distances = {
      left: Math.min(...collisions.left.map((x) => x.distance)),
      right: Math.min(...collisions.right.map((x) => x.distance)),
      top: Math.min(...collisions.top.map((x) => x.distance)),
      bottom: Math.min(...collisions.bottom.map((x) => x.distance)),
    };

    if (this.onWin !== null) {
      let winBlocks = neighbors.filter((b) => {
        return b.type === BlockType.Victory;
      });

      let winCollisions = {
        left: leftRays.map((r) => raycast(r, winBlocks)).filter((r) => r),
        right: rightRays.map((r) => raycast(r, winBlocks)).filter((r) => r),
        top: topRays.map((r) => raycast(r, winBlocks)).filter((r) => r),
        bottom: bottomRays.map((r) => raycast(r, winBlocks)).filter((r) => r),
      };

      let winDistances = [
        Math.min(...winCollisions.left.map((x) => x.distance)),
        Math.min(...winCollisions.right.map((x) => x.distance)),
        Math.min(...winCollisions.top.map((x) => x.distance)),
        Math.min(...winCollisions.bottom.map((x) => x.distance)),
      ];

      console.log(winDistances);

      if (Math.min(...winDistances) <= 1 || level.at(t(this.x), t(this.y)).type === BlockType.Victory) {
        this.onWin();
      }
    }

    if (DEBUG_DRAW_COLLISION_TRACERS) debugDistances = distances;

    return distances;
  }
}

export class Camera extends Entity {
  width: number;
  height: number;
  hw: number;
  hh: number;
  follow: Entity | null;

  constructor() {
    super();

    this.width = canvas.width;
    this.height = canvas.height;
    this.hw = this.width / 2;
    this.hh = this.height / 2;
    this.follow = null;

    this.maxdx = this.maxdy = MAXDX * 2;

    this.accel = this.maxdx;
    this.friction = this.maxdx;

    this.omnipotent = true;
  }

  updateAndFollow(dt: number, level: Level, follow: Entity) {
    this.follow = follow;
    this.update(dt, level);
  }

  update(dt: number, level: Level) {
    super.update(dt, level);

    if (this.follow !== null) {
      this.x = this.follow.x;
      this.y = this.follow.y;
    }

    if (this.x - this.hw < 0) this.x = this.hw;
    if (this.x + this.hw > width) this.x = width - this.hw;
    if (this.y - this.hh < 0) this.y = this.hh;
    if (this.y + this.hh > height) this.y = height - this.hh;
  }
}

// DEBUG
export let debugDistances: { left: number; right: number; bottom: number; top: number };
export let rayQueue: Ray[] = [];
export let aabbQueue: AABB[] = [];
export function flushDebugDrawQueues(camera: Camera) {
  if (!debugDistances || !debugDistances.left) return;
  if (debugDistances.left === Infinity) debugDistances.left = 10000;
  if (debugDistances.right === Infinity) debugDistances.right = 10000;
  if (debugDistances.top === Infinity) debugDistances.top = 10000;
  if (debugDistances.bottom === Infinity) debugDistances.bottom = 10000;

  rayQueue.map(function (ray) {
    ctx.beginPath();
    let x = cx(ray.origin.x, camera);
    let y = cy(ray.origin.y, camera);

    ctx.moveTo(x, y);
    switch (ray.direction) {
      case Direction.LEFT:
        ctx.strokeStyle = '#00bb55';
        ctx.lineTo(x - debugDistances.left, y);
        break;
      case Direction.RIGHT:
        ctx.strokeStyle = '#ff00ff';
        ctx.lineTo(x + debugDistances.right, y);
        break;
      case Direction.UP:
        ctx.strokeStyle = '#ffff00';
        ctx.lineTo(x, y - debugDistances.top);
        break;
      case Direction.DOWN:
        ctx.strokeStyle = '#ff0000';
        ctx.lineTo(x, y + debugDistances.bottom);
        break;
    }

    ctx.lineWidth = 10;
    ctx.stroke();
  });

  aabbQueue.forEach((b) => {
    ctx.beginPath();
    ctx.rect(cx(b.x, camera), cy(b.y, camera), TILE, TILE);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.stroke();
  });

  rayQueue = [];
  aabbQueue = [];
}
// END DEBUG
