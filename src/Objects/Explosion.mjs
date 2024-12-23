import { BlockType, BlockProps } from "../Map/BlockType.mjs";
import { Vec2 } from "../Data/Vec2.mjs";
import { Sprite2D } from "../Rendering/Sprite2D.mjs";
import { Images } from "../Rendering/Images.mjs";
import { BreakingWall } from "./BreakingWall.mjs";

export class Explosion {
	constructor(main, pos, explosionRange) {
		this.main = main;
		this.pos = pos.copy();
		this.time = 0.8;
		this.explosionRange = explosionRange;
		this.changes = [];
		this.main.addObject(this);
		this.explode();
	}
	explode() {
		this.main.sfx.play(this.main.sfx.sounds.explosion);
		const floorPos = this.pos.floor();
		const gameMap = this.main.gameMap;
		let extra = 0;
		if (BlockProps[gameMap.getTile(floorPos.x, floorPos.y)].explosion) {
			extra = gameMap.getTileExtra(floorPos.x, floorPos.y);
		}
		gameMap.setTile(floorPos.x, floorPos.y, BlockType.EXPLOSION_CROSS, extra + 1);
		this.changes.push(floorPos);
		const range = this.explosionRange;
		this.fillRay(floorPos, new Vec2( 1, 0), range, BlockType.EXPLOSION_X, gameMap);
		this.fillRay(floorPos, new Vec2(-1, 0), range, BlockType.EXPLOSION_X, gameMap);
		this.fillRay(floorPos, new Vec2(0,  1), range, BlockType.EXPLOSION_Y, gameMap);
		this.fillRay(floorPos, new Vec2(0, -1), range, BlockType.EXPLOSION_Y, gameMap);
		this.updateShapes();
		this.main.renderer.screenShake += 1;
		this.main.notifyBlockUpdate();
	}
	loopFrame(dt) {
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
			const props = BlockProps[tile];
			if (props.solid && props.destroyable) {
				const replaceWith = gameMap.getTileExtra(pos.x, pos.y);
				gameMap.setTile(pos.x, pos.y, replaceWith, 0);
				this.main.sfx.play(this.main.sfx.sounds.wallBreak);
				new BreakingWall(main, pos.addScalar(0.5, 0.5));
				break;
			}
			else if (props.explosion) {
				const extra = gameMap.getTileExtra(pos.x, pos.y);
				gameMap.setTile(pos.x, pos.y, fill, extra + 1);
				this.changes.push(pos.copy());
			}
			else if (tile == BlockType.AIR) {
				gameMap.setTile(pos.x, pos.y, fill, 1);
				this.changes.push(pos.copy());
			}
			else {
				break;
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
		this.main.notifyBlockUpdate();
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
				gameMap.setJustTile(pos.x, pos.y, this.getExplosionTileShape(pos, gameMap));
			}
		}
	}
}