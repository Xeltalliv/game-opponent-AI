import { DataLayer } from "../Data/DataLayer.mjs";
import { BlockType, BlockProps } from "./BlockType.mjs";
import { Vec2 } from "../Data/Vec2.mjs";
import { randomFromArray, popRandomFromArray, randomInt } from "../Utils.mjs";

export class GameMap {
	constructor(main) {
		this.width = 1;
		this.height = 1;
		this.layerTiles = null;
		this.layerExtra = null;
		this.layerDanger = null;
		this.layerRangeXP = null;
		this.layerRangeXN = null;
		this.layerRangeYP = null;
		this.layerRangeYN = null;
		this.layerDebug = null //this.layerDanger;
		this.size = new Vec2(1, 1);
		this.exitPos = new Vec2();
	}
	initMapFromGMG(layer) {
		const width0 = layer.width;
		const height0 = layer.height;
		const width = this.width = width0 * 2 + 1;
		const height = this.height = height0 * 2 + 1;
		this.layerTiles = new DataLayer(Uint8Array, width, height);
		this.layerExtra = new DataLayer(Uint8Array, width, height);
		this.layerDanger = new DataLayer(Uint8Array, width, height);
		this.size.setScalar(this.width, this.height);
		this.layerTiles.fill(BlockType.HARD_WALL);
		for(let y=1, y0=0; y<height; y+=2, y0++) {
			for(let x=1, x0=0; x<width; x+=2, x0++) {
				if (layer.get(x0, y0) === 0) {
					this.setTile(x, y, BlockType.AIR);
				}
			}
		}
		for(let y=1, y0=0; y<height; y+=2, y0++) {
			for(let x=1, x0=0; x<width-2; x+=2, x0++) {
				if (layer.get(x0, y0) === 0 && layer.get(x0+1, y0) === 0) {
					this.setTile(x+1, y, BlockType.AIR);
				}
			}
		}
		for(let y=1, y0=0; y<height-2; y+=2, y0++) {
			for(let x=1, x0=0; x<width; x+=2, x0++) {
				if (layer.get(x0, y0) === 0 && layer.get(x0, y0+1) === 0) {
					this.setTile(x, y+1, BlockType.AIR);
				}
			}
		}
		this.addBonusesAndExit(width, height);
		this.updateDangerMap(width, height);
	}
	initMapSimple(width, height, powerupsPerLevel) {
		this.width = width;
		this.height = height;
		this.layerTiles = new DataLayer(Uint8Array, width, height);
		this.layerExtra = new DataLayer(Uint8Array, width, height);
		this.layerDanger = new DataLayer(Uint8Array, width, height);
		this.layerRangeXP = new DataLayer(Uint8Array, width, height);
		this.layerRangeXN = new DataLayer(Uint8Array, width, height);
		this.layerRangeYP = new DataLayer(Uint8Array, width, height);
		this.layerRangeYN = new DataLayer(Uint8Array, width, height);
		this.pathfinding = new DataLayer(Uint32Array, width, height);
		//this.layerDebug = this.layerRangeYN;
		//this.layerDebug = this.layerDanger;
		this.size = new Vec2(width, height);
		//this.initEmpty(width, height);
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				let threshold = 0.5; //((x + y) % 2) * 0.8 + 0.1;
				//const playerDist = Math.sqrt(x * x + y * y) / 10;
				//const enemyDist = Math.sqrt((x - 9) * (x - 9) + (y - 9) * (y - 9)) / 10;
				//threshold *= Math.min(1, Math.min(playerDist, enemyDist));
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
		this.addBonusesAndExit(powerupsPerLevel);
	}
	postPrepare() {
		this.updateDangerMap();
		this.updateRangeMap();
	}
	getSpawnPos(avoidPos) {
		const width = this.width;
		const height = this.height;
		let x = 0, y = 0, maxDist = 0;
		if (avoidPos) {
			for(let i=0; i<5; i++) {
				const cx = randomInt(0, (width-3)/2) * 2 + 1;
				const cy = randomInt(0, (height-3)/2) * 2 + 1;
				const dist = Math.abs(cx - avoidPos.x) + Math.abs(cy - avoidPos.y);
				if (dist > maxDist) {
					maxDist = dist;
					x = cx;
					y = cy;
				}
			}
		} else {
			x = randomInt(0, (width-3)/2) * 2 + 1;
			y = randomInt(0, (height-3)/2) * 2 + 1;
		}
		let dirX = Math.random() < 0.5 ? -1 : 1;
		let dirY = Math.random() < 0.5 ? -1 : 1;
		if (x === 1) dirX = 1;
		if (x === width-2) dirX = -1;
		if (y === 1) dirY = 1;
		if (y === height-2) dirY = -1;
		this.setTile(x, y, BlockType.AIR);
		this.setTile(x+dirX, y, BlockType.AIR);
		this.setTile(x, y+dirY, BlockType.AIR);
		return new Vec2(x, y);
	}
	addBonusesAndExit(powerupsPerLevel) {
		const width = this.width;
		const height = this.height;
		const softWalls = [];
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				if (this.getTile(x, y) == BlockType.SOFT_WALL) softWalls.push(new Vec2(x,y));
			}
		}
		const exitPos = popRandomFromArray(softWalls);
		this.setTileExtra(exitPos.x, exitPos.y, BlockType.EXIT);
		const hiddenTypes = BlockProps.map((prop, index) => ({prop, index})).filter(e => e.prop.powerup).map(e => e.index);
		const powerups = Math.min(softWalls.length, powerupsPerLevel);
		for(let i=0; i<powerups; i++) {
			const bonusPos = popRandomFromArray(softWalls);
			this.setTileExtra(bonusPos.x, bonusPos.y, randomFromArray(hiddenTypes));
		}
	}
	updateDangerMap() {
		const width = this.width;
		const height = this.height;
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				const props = BlockProps[this.getTile(x, y)];
				let set = 0;
				if (props.solid && props.destroyable) set = 1;
				if (props.solid && !props.destroyable) set = 2;
				this.setDangerTile(x, y, set);
			}
		}
	}
	updateRangeMap() {
		const width = this.width;
		const height = this.height;
		for(let y=0; y<height; y++) {
			let paint = 255;
			for(let x=0; x<width; x++) {
				const props = BlockProps[this.getTile(x, y)];
				if (props.solid) {
					if (props.destroyable) paint=0;
					if (!props.destroyable) paint=255;
				} else {
					if (paint < 255) paint++;
				}
				this.layerRangeXP.set(x, y, paint);
			}
		}
		for(let y=0; y<height; y++) {
			let paint = 255;
			for(let x=width-1; x>=0; x--) {
				const props = BlockProps[this.getTile(x, y)];
				if (props.solid) {
					if (props.destroyable) paint=0;
					if (!props.destroyable) paint=255;
				} else {
					if (paint < 255) paint++;
				}
				this.layerRangeXN.set(x, y, paint);
			}
		}
		for(let x=0; x<width; x++) {
			let paint = 255;
			for(let y=0; y<height; y++) {
				const props = BlockProps[this.getTile(x, y)];
				if (props.solid) {
					if (props.destroyable) paint=0;
					if (!props.destroyable) paint=255;
				} else {
					if (paint < 255) paint++;
				}
				this.layerRangeYP.set(x, y, paint);
			}
		}
		for(let x=0; x<width; x++) {
			let paint = 255;
			for(let y=height-1; y>=0; y--) {
				const props = BlockProps[this.getTile(x, y)];
				if (props.solid) {
					if (props.destroyable) paint=0;
					if (!props.destroyable) paint=255;
				} else {
					if (paint < 255) paint++;
				}
				this.layerRangeYN.set(x, y, paint);
			}
		}
	}
	fill(x1, y1, x2, y2, value) {
		for(let y=y1; y<y2; y++) {
			for(let x=x1; x<x2; x++) {
				this.setTile(x, y, value);
			}
		}
	}
	getTile(x, y) {
		return this.layerTiles.get(x, y);
	}
	setTile(x, y, value, extra=0) {
		this.layerTiles.set(x, y, value);
		this.layerExtra.set(x, y, extra);
		//console.log("st", value, extra, "at", x, y);
	}
	setJustTile(x, y, value) {
		this.layerTiles.set(x, y, value);
	}
	getTileExtra(x, y) {
		return this.layerExtra.get(x, y);
	}
	setTileExtra(x, y, value) {
		this.layerExtra.set(x, y, value);
	}
	getDangerTile(x, y) {
		return this.layerDanger.get(x, y);
	}
	setDangerTile(x, y, value) {
		return this.layerDanger.set(x, y, value);
	}
	getInRange(x, y, rangeLevel) {
		let sum = 0;
		sum += this.layerRangeXP.get(x, y) <= rangeLevel;
		sum += this.layerRangeXN.get(x, y) <= rangeLevel;
		sum += this.layerRangeYP.get(x, y) <= rangeLevel;
		sum += this.layerRangeYN.get(x, y) <= rangeLevel;
		return sum;
	}
}