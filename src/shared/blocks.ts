import { entities, TILE } from '../client/const';
import { Mushroom } from '../client/entity';

export enum BlockType {
  Platform,
  None,
  Item,
  Victory,
}

export class Block {
  type: BlockType;
  x: number;
  y: number;

  active: boolean;

  constructor(x: number, y: number) {
    this.type = BlockType.None;
    this.x = x;
    this.y = y;

    this.active = false;
  }

  getStyle(): string | HTMLImageElement {
    return '#55ddff';
  }

  activationAction() {}

  getActivatedState() {
    this.active = true;
    return this;
  }

  getBkgStyle(): null | string {
    return null;
  }

  passable() {
    return true;
  }
}

export class PlatformBlock extends Block {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = BlockType.Platform;
  }

  getStyle() {
    if (this.active) return '#fff000';
    return (this.x + this.y) % 2 === 0 ? '#55ff55' : '#33bb33';
  }

  passable() {
    return false;
  }
}

export class ItemBlock extends Block {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = BlockType.Item;
  }

  getStyle() {
    let img = new Image();

    if (this.active) img.src = '/images/usedblock.png';
    else img.src = '/images/questionmark.png';

    return img;
  }

  passable() {
    return false;
  }

  activationAction() {
    if (this.active) return;
    let mushroom = new Mushroom();
    mushroom.x = this.x * TILE;
    mushroom.y = (this.y - 1) * TILE;
    

    entities.push(mushroom);
  }
}

export class VictoryBlock extends Block {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = BlockType.Victory;
  }

  getStyle() {
    let img = new Image();
    img.src = '/images/win.png';
    img.style.rotate = `${(Date.now() / 30) % 360}`;
    return img;
  }

  getBkgStyle() {
    return '#55ddff';
  }

  passable() {
    return true;
  }
}

export const genBlock = (x: number, y: number, type: BlockType) => {
  switch (type) {
    case BlockType.Platform:
      return new PlatformBlock(x, y);
    case BlockType.None:
      return new Block(x, y);
    case BlockType.Item:
      return new ItemBlock(x, y);
    case BlockType.Victory:
      return new VictoryBlock(x, y);
  }
};
