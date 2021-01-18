export enum BlockType {
  Platform,
  None,
  Item,
}

export class Block {
  type: BlockType;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.type = BlockType.None;
    this.x = x;
    this.y = y;
  }

  action() {}

  getStyle(): string | HTMLImageElement {
    return '#55ddff';
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
    img.src = './images/questionmark.png'
    return img;
  }

  passable() {
    return false;
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
  }
};
