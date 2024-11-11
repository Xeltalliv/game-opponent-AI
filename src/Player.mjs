import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";
import { Bomb } from "./Bomb.mjs";
import { Images } from "./Images.mjs";
import { BoxCollider } from "./BoxCollider.mjs";
import { BlockType } from "./BlockType.mjs";

const CollsionOffsets = new Vec2(-0.5, 0.5);

export class Player {
	constructor(main) {
		this.main = main;
		this.pos = new Vec2(1.5,1.5);
		this.inputManager = main.inputManager;
		this.sprite = new Sprite2D(this.pos, Images.player);
		this.boundDropBomb = this.dropBomb.bind(this);
		this.boundNextLevel = this.nextLevel.bind(this);
		this.inputManager.getAction("primaryAction").onActionDown(this.boundDropBomb);
		this.boxCollider = new BoxCollider(new Vec2(0.49, 0.49));
		this.myBombs = [];
		this.dead = false;
		this.deathAnim = 0;

		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	loop(dt) {
		if (!this.dead) {
			const moveVec = new Vec2(0,0);
			if (this.inputManager.getAction("walkLeft").active) moveVec.x -= 1;
			if (this.inputManager.getAction("walkRight").active) moveVec.x += 1;
			if (this.inputManager.getAction("walkUp").active) moveVec.y -= 1;
			if (this.inputManager.getAction("walkDown").active) moveVec.y += 1;
			moveVec.selfMulScalar(dt * this.main.stats.movementSpeed);
			const gameMap = this.main.gameMap;
			if (moveVec.x !== 0) {
				if (this.boxCollider.check(this.pos.addScalar(moveVec.x, 0), gameMap)) {
					const testPos = new Vec2(this.pos.x, Math.floor(this.pos.y) + 0.5);
					if (this.boxCollider.check(testPos.addScalar(moveVec.x, 0), gameMap)) {
						this.pos.x = Math.floor(this.pos.x) + 0.5;
					} else {
						this.pos.y = stepTowards(this.pos.y, Math.floor(this.pos.y) + 0.5, moveVec.length());
						moveVec.clear();
					}
				} else {
					this.pos.selfAddScalar(moveVec.x, 0);
				}
			}
			if (moveVec.y !== 0) {
				if (this.boxCollider.check(this.pos.addScalar(0, moveVec.y), gameMap)) {
					const testPos = new Vec2(Math.floor(this.pos.x) + 0.5, this.pos.y);
					if (this.boxCollider.check(testPos.addScalar(0, moveVec.y), gameMap)) {
						this.pos.y = Math.floor(this.pos.y) + 0.5;
					} else {
						this.pos.x = stepTowards(this.pos.x, Math.floor(this.pos.x) + 0.5, moveVec.length());
						moveVec.clear();
					}
				} else {
					this.pos.selfAddScalar(0, moveVec.y);
				}
			}
			if (this.boxCollider.check(this.pos.addScalar(0, moveVec.y), gameMap, "explosion")) {
				this.dead = true;
			}
		} else {
			this.deathAnim += dt * 10;
			this.sprite.image = Images.playerDying[Math.min(Math.floor(this.deathAnim), 4)];
			if (this.deathAnim > 8) {
				this.main.restartLevel();
			}
		}
		this.sprite.depth = -this.pos.y
	}
	dropBomb() {
		const pos = this.pos.floor();
		if (this.main.gameMap.getTile(pos.x, pos.y) === BlockType.EXIT) {
			this.inputManager.getAction("primaryAction").onActionUp(this.boundNextLevel);
			return;
		}
		if (this.myBombs.length >= this.main.stats.maxBombs) return;
		const bomb = new Bomb(main, this.pos.floor().add(new Vec2(0.5, 0.5)), 3, 3, this);
		this.myBombs.push(bomb);
	}
	removeBomb(bomb) {
		const index = this.myBombs.indexOf(bomb);
		if (index > -1) this.myBombs.splice(index, 1);
	}
	nextLevel() {
		this.inputManager.getAction("primaryAction").removeOnActionUp(this.boundNextLevel);
		this.main.nextLevel();
	}
	destroy() {
		this.inputManager.getAction("primaryAction").removeOnActionDown(this.boundDropBomb);
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}

function stepTowards(current, target, limit) {
	let offset = target - current;
	if (offset >  limit) offset = limit;
	if (offset < -limit) offset = -limit;
	return current + offset;
}