export const MAP = { w: 35, h: 25 };

export enum BlockType {
  Platform = 'platform',
  None = 'none',
}

export class Level {
  rows: Row[];
  sizeY: number;
  sizeX: number;
  playerX: number;
  playerY: number;

  constructor() {
    this.sizeY = MAP.h;
    this.sizeX = MAP.w;
    this.playerX = 5;
    this.playerY = 10;

    this.rows = [];
    for (let i = 0; i < this.sizeY; i++) this.rows[i] = new Row(this.sizeX, i);
    console.log(this.sizeY);

    this.rows[this.sizeY - 1].fill(BlockType.Platform);
    this.rows[this.sizeY - 2].fill(BlockType.Platform);
  }

  at(x: number, y: number) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (y >= this.rows.length) return new Block(BlockType.None, x, y);
    if (y < 0 || x < 0) return new Block(BlockType.Platform, x, y);

    let row = this.rows[y];
    if (x >= row.blocks.length) return new Block(BlockType.Platform, x, y);

    return new Block(row.blocks[x].type, row.blocks[x].x, row.blocks[x].y); // idk sometimes it returns an object so now I have to fix it
  }
}

export class Row {
  blocks: Block[];
  size: number;
  y: number;

  constructor(size: number, y: number) {
    this.blocks = [];
    this.size = size;
    this.y = y;

    this.fill(BlockType.None);
  }

  setBlock(index: number, block: BlockType) {
    this.blocks[index] = new Block(block, index, this.y);
  }

  fill(block: BlockType) {
    for (let i = 0; i < this.size; i++) this.blocks[i] = new Block(block, i, this.y);
  }
}

export class Block {
  type: BlockType;
  x: number;
  y: number;

  constructor(type: BlockType, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
  }

  passable() {
    return this.type !== BlockType.Platform;
  }
}
