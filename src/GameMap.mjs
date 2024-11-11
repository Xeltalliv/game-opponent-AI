import { BlockType, HiddenType } from "./BlockType.mjs";
import { Vec2 } from "./Vec2.mjs";
import { randomFromArray, popRandomFromArray } from "./Utils.mjs";

export class GameMap {
	constructor(main, width, height) {
		this.width = width;
		this.height = height;
		this.map = null;
		this.mapExtra = null;
		this.size = new Vec2(width, height);
		this.initMap(width, height);
		this.exitPos = new Vec2();
	}
	initMap(width, height) {
		this.initEmpty(width, height);
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				let threshold = 0.3; //((x + y) % 2) * 0.8 + 0.1;
				threshold *= Math.min(1, Math.sqrt(x * x + y * y) / 10);
				if (Math.random() < threshold) this.setTile(x, y, BlockType.SOFT_WALL);
			}
		}
		for(let y=0; y<height; y+=2) {
			for(let x=0; x<width; x+=2) {
				this.setTile(x, y, BlockType.HARD_WALL);
			}
		}
		this.fill(0, 0, width, 1, BlockType.HARD_WALL);
		this.fill(0, height-1, width, height, BlockType.HARD_WALL);
		this.fill(0, 0, 1, height, BlockType.HARD_WALL);
		this.fill(width-1, 0, width, height, BlockType.HARD_WALL);
		this.setTile(1, 1, BlockType.AIR);
		this.setTile(2, 1, BlockType.AIR);
		this.setTile(3, 1, BlockType.AIR);
		this.setTile(3, 2, BlockType.AIR);
		this.setTile(1, 2, BlockType.AIR);
		this.setTile(1, 3, BlockType.AIR);
		this.setTile(2, 3, BlockType.AIR);
		this.addBonusesAndExit(width, height);
	}
	addBonusesAndExit(width, height) {
		const softWalls = [];
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				if (this.getTile(x, y) == BlockType.SOFT_WALL) softWalls.push(new Vec2(x,y));
			}
		}
		const exitPos = popRandomFromArray(softWalls);
		this.setTileExtra(exitPos.x, exitPos.y, HiddenType.EXIT);
		const hiddenTypes = [
			HiddenType.POWERUP_BOMBS,
			HiddenType.POWERUP_RANGE,
			HiddenType.POWERUP_SPEED,
			HiddenType.POWERUP_LIFE,
		];
		for(let i=0; i<6; i++) {
			const bonusPos = popRandomFromArray(softWalls);
			this.setTileExtra(bonusPos.x, bonusPos.y, randomFromArray(hiddenTypes));
		}
	}
	initEmpty(width, height) {
		const map = [];
		const mapExtra = [];
		for(let y=0; y<height; y++) {
			const row = [];
			const rowExtra = [];
			for(let x=0; x<width; x++) {
				row.push(BlockType.AIR);
				rowExtra.push(0);
			}
			map.push(row);
			mapExtra.push(rowExtra);
		}
		this.map = map;
		this.mapExtra = mapExtra;
	}
	fill(x1, y1, x2, y2, value) {
		for(let y=y1; y<y2; y++) {
			for(let x=x1; x<x2; x++) {
				this.setTile(x, y, value);
			}
		}
	}
	getTile(x, y) {
		return this.map[y][x];
	}
	setTile(x, y, value) {
		this.map[y][x] = value;
	}
	getTileExtra(x, y) {
		return this.mapExtra[y][x];
	}
	setTileExtra(x, y, value) {
		this.mapExtra[y][x] = value;
	}
}