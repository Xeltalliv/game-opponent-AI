import { BlockType, BlockProps, HiddenType } from "./BlockType.mjs";
import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";
import { Images } from "./Images.mjs";
import { BreakingWall } from "./BreakingWall.mjs";
import { PowerUp } from "./PowerUp.mjs";

export class Explosion {
	constructor(main, pos) {
		this.main = main;
		this.pos = pos.copy();
		this.time = 0.8;
		this.changes = [];
		this.main.addObject(this);
		this.explode();
	}
	explode() {
		const floorPos = this.pos.floor();
		const gameMap = this.main.gameMap;
		let extra = 0;
		if (BlockProps[gameMap.getTile(floorPos.x, floorPos.y)].explosion) {
			extra = gameMap.getTileExtra(floorPos.x, floorPos.y);
		}
		gameMap.setTile(floorPos.x, floorPos.y, BlockType.EXPLOSION_CROSS);
		gameMap.setTileExtra(floorPos.x, floorPos.y, extra + 1);
		this.changes.push(floorPos);
		const range = this.main.stats.explosionRange;
		this.fillRay(floorPos, new Vec2( 1, 0), range, BlockType.EXPLOSION_X, gameMap);
		this.fillRay(floorPos, new Vec2(-1, 0), range, BlockType.EXPLOSION_X, gameMap);
		this.fillRay(floorPos, new Vec2(0,  1), range, BlockType.EXPLOSION_Y, gameMap);
		this.fillRay(floorPos, new Vec2(0, -1), range, BlockType.EXPLOSION_Y, gameMap);
		this.updateShapes();
		this.main.renderer.screenShake += 1;
	}
	loop(dt) {
		this.time -= dt;
		if (this.time <= 0) {
			this.destroy();
		}
	}
	fillRay(originPos, dir, length, fill, gameMap) {
		const pos = originPos.copy();
		for(let i=0; i<length; i++) {
			pos.selfAdd(dir);
			const tile = gameMap.getTile(pos.x, pos.y);
			if (tile == BlockType.HARD_WALL) break;
			if (tile == BlockType.SOFT_WALL) {
				const extra = gameMap.getTileExtra(pos.x, pos.y);
				let replaceWith = BlockType.AIR;
				if (extra == HiddenType.EXIT) replaceWith = BlockType.EXIT;
				console.log("ex", extra);
				if (extra == HiddenType.POWERUP_BOMBS) new PowerUp(this.main, pos.addScalar(0.5, 0.5), Images.powerup.bomb, "maxBombs", 1);
				if (extra == HiddenType.POWERUP_RANGE) new PowerUp(this.main, pos.addScalar(0.5, 0.5), Images.powerup.range, "explosionRange", 1);
				if (extra == HiddenType.POWERUP_SPEED) new PowerUp(this.main, pos.addScalar(0.5, 0.5), Images.powerup.speed, "movementSpeed", 1);
				if (extra == HiddenType.POWERUP_LIFE)  new PowerUp(this.main, pos.addScalar(0.5, 0.5), Images.powerup.life, "lives", 1);
				gameMap.setTile(pos.x, pos.y, replaceWith);
				gameMap.setTileExtra(pos.x, pos.y, 0);
				new BreakingWall(main, pos.addScalar(0.5, 0.5));
				break;
			}
			if (tile == BlockType.AIR || BlockProps[tile].explosion) {
				const extra = gameMap.getTileExtra(pos.x, pos.y);
				gameMap.setTile(pos.x, pos.y, fill);
				gameMap.setTileExtra(pos.x, pos.y, extra + 1);
				this.changes.push(pos.copy());
			}
		}
	}
	destroy() {
		const gameMap = main.gameMap;
		for(const pos of this.changes) {
			const tile = gameMap.getTile(pos.x, pos.y);
			const extra = gameMap.getTileExtra(pos.x, pos.y);
			if (BlockProps[tile].explosion) {
				if (extra == 1) {
					gameMap.setTile(pos.x, pos.y, BlockType.AIR);
				}
				gameMap.setTileExtra(pos.x, pos.y, extra - 1);
			}
		}
		this.updateShapes();
		this.main.removeObject(this);
	}
	getExplosionTileShape(pos, gameMap) {
		const xn = (BlockProps[gameMap.getTile(pos.x - 1, pos.y)].explosion ||
		            BlockProps[gameMap.getTile(pos.x + 1, pos.y)].explosion);
		const yn = (BlockProps[gameMap.getTile(pos.x, pos.y - 1)].explosion ||
		            BlockProps[gameMap.getTile(pos.x, pos.y + 1)].explosion);
		let out = BlockType.EXPLOSION_CROSS;
		if (xn && !yn) out = BlockType.EXPLOSION_X;
		if (!xn && yn) out = BlockType.EXPLOSION_Y;
		return out;
	}
	updateShapes() {
		const gameMap = main.gameMap;
		for(const pos of this.changes) {
			const tile = gameMap.getTile(pos.x, pos.y);
			if (BlockProps[tile].explosion) {
				gameMap.setTile(pos.x, pos.y, this.getExplosionTileShape(pos, gameMap));
			}
		}
	}
}