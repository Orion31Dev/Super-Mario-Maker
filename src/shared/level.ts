import { Block, BlockType, genBlock } from "./blocks";

export const MAP = { w: 35, h: 17 };

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

    this.rows[this.sizeY - 1].fill(BlockType.Platform);
    this.rows[this.sizeY - 2].fill(BlockType.Platform);
  }

  at(x: number, y: number) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (y >= this.rows.length) return genBlock(x, y, BlockType.None);
    if (y < 0 || x < 0) return genBlock(x, y, BlockType.Platform);

    let row = this.rows[y];
    if (x >= row.blocks.length) return genBlock(x, y, BlockType.Platform);

    // idk sometimes it returns an object and not a block so to make sure it's a block I recreate the obj
    if (row.blocks[x].active) return genBlock(row.blocks[x].x, row.blocks[x].y, row.blocks[x].type).getActivatedState();
    else return genBlock(row.blocks[x].x, row.blocks[x].y, row.blocks[x].type); 
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
    this.blocks[index] = genBlock(index, this.y, block);
  }

  fill(block: BlockType) {
    for (let i = 0; i < this.size; i++) this.blocks[i] = genBlock(i, this.y, block);
  }
}
