import { Vec2 } from "../../Data/Vec2.mjs";
import { Sprite2D, TintedSprite2D, Text2D } from "../../Rendering/Sprite2D.mjs";
import { Bomb } from "../Bomb.mjs";
import { Images } from "../../Rendering/Images.mjs";
import { BlockType, BlockProps } from "../../Map/BlockType.mjs";
import { InterpolatedVec2 } from "../../Data/Interpolated.mjs";
import { Shield } from "../Shield.mjs";
import { randomFloat } from "../../Utils.mjs";

const CollsionOffsets = new Vec2(-0.5, 0.5);

export class Humanoid {

	constructor(main) {
		this.main = main;

		this.pos = new Vec2(1.5,1.5);
		this.intPos = new Vec2(1,1);
		//new Vec2(1,1);
		this.offsetVec = new Vec2(0,0);
		this.offsetMax = 10;
		this.posInterpolation = new InterpolatedVec2();
		this.posInterpolation.setVec(this.pos, 0);
		this.isMoving = false;

		this.sprite = new TintedSprite2D(this.pos, Images.player);
		this.remoteSprite = null;
		this.myBombs = [];
		this.dead = false;
		this.deathAnim = 0;
		this.maxBombs = 1;
		this.explosionRange = 1;
		this.movementSpeed = 3;
		this.remote = false;
		this.invulnerable = 0;
		this.powerups = 0;
		this.statProperties = ["maxBombs", "explosionRange", "movementSpeed", "powerups"];

		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	updatePos(time) {
		this.posInterpolation.setVec(this.intPos.addScalar(0.5,0.5).add(this.offsetVec.divScalar(this.offsetMax)), time);
	}
	updatePosForce(time) {
		this.posInterpolation.setVecForce(this.intPos.addScalar(0.5,0.5).add(this.offsetVec.divScalar(this.offsetMax)), time);
	}
	loopFrame(dt, time) {
		this.pos.setVec(this.posInterpolation.get(time));
		if (this.isMoving && this.main.settings.viewBob) this.pos.selfAddScalar(0, -Math.abs(Math.sin(time * 20) * 0.1));
		if (this.remoteSprite) {
			this.remoteSprite.pos.setVec(this.pos.addScalar(0.4, 0));
		}
	}
	loopFixed(dt, time, tick) {
		if (!this.dead) {
			if (this.invulnerable > 0) {
				const shield = new Shield(this.main, this.pos, 0.3);
				shield.pos.selfAddScalar(randomFloat(-0.5, 0.5), randomFloat(-0.5, 0.5));
				shield.velFromDirSpeed(Math.random() * 2 * Math.PI, Math.random());
				this.invulnerable--;
			}
			if (this.checkDeath()) {
				this.die();
			}
			this.handleAI();
			this.handleMovement();
			if (this.isMoving && tick % 10 == 0) {
				if ((tick / 10) % 2 == 0) {
					this.main.sfx.play(this.main.sfx.sounds.stepR);
				} else {
					this.main.sfx.play(this.main.sfx.sounds.stepL);
				}
			}
			
			const newPosMul = this.intPos.mulScalar(this.offsetMax).add(this.offsetVec);
			this.intPos = newPosMul.divScalar(this.offsetMax).round();
			this.offsetVec = newPosMul.sub(this.intPos.mulScalar(this.offsetMax));
			this.updatePos(time);
			if (this.checkDeath()) {
				this.die();
			}
			const powerUpPos = this.checkPowerUp();
			if (powerUpPos) {
				const tile = this.main.gameMap.getTile(powerUpPos.x, powerUpPos.y);
				this.main.gameMap.setTile(powerUpPos.x, powerUpPos.y, BlockType.AIR);
				this.handlePowerUp(tile);
			}
		} else {
			this.isMoving = false;
			this.updatePos(time);
			this.deathAnim += 0.5;
			this.sprite.image = Images.playerDying[Math.min(Math.floor(this.deathAnim), 4)];
			if (this.deathAnim > 8) {
				this.onDeathAnimationEnd();
			}
		}
		this.sprite.depth = -this.pos.y
	}
	die() {
		if (this.invulnerable > 0) return;
		if (this.dead) return;
		this.main.sfx.play(this.main.sfx.sounds.death);
		this.dead = true;
	}
	handleAI() {}
	handleMovement() {}
	onDeathAnimationEnd() {}
	checkCanMove(moveX, moveY) {
		if (this.offsetVec.x * moveX < 0) return true;
		if (this.offsetVec.y * moveY < 0) return true;
		return BlockProps[this.main.gameMap.getTile(this.intPos.x + moveX, this.intPos.y + moveY)].solid !== true;
	}
	checkDeath() {
		const pos1 = this.intPos;
		const pos2 = this.intPos.add(this.offsetVec.sign());
		return BlockProps[this.main.gameMap.getTile(pos1.x, pos1.y)].kills ||
		       BlockProps[this.main.gameMap.getTile(pos2.x, pos2.y)].kills;
	}
	checkPowerUp() {
		const pos1 = this.intPos;
		const pos2 = this.intPos.add(this.offsetVec.sign());
		if (BlockProps[this.main.gameMap.getTile(pos1.x, pos1.y)].powerup) return pos1;
		if (BlockProps[this.main.gameMap.getTile(pos2.x, pos2.y)].powerup) return pos2;
		return null;
	}
	primaryAction() {
		this.dropBomb();
	}
	secondaryAction() {
		if (!this.remote) return;
		for(const bomb of this.myBombs) {
			bomb.explode();
		}
	}
	dropBomb() {
		if (this.myBombs.length >= this.maxBombs) return false;
		const bomb = new Bomb(this.main, this.intPos.add(new Vec2(0.5, 0.5)), 60, this.explosionRange, this);
		this.myBombs.push(bomb);
		return true;
	}
	canDropBomb() {
		if (this.myBombs.length >= this.maxBombs) return false;
		return true;
	}
	removeBomb(bomb) {
		const index = this.myBombs.indexOf(bomb);
		if (index > -1) this.myBombs.splice(index, 1);
	}
	handlePowerUp(tile) {
		this.powerups++;
		if (tile == BlockType.POWERUP_BOMBS) {
			this.maxBombs++;
		}
		if (tile == BlockType.POWERUP_RANGE) {
			this.explosionRange++;
		}
		if (tile == BlockType.POWERUP_SPEED) {
			this.movementSpeed++;
			this.offsetVec.selfDivScalar(this.offsetMax);
			this.offsetMax = Math.round(30 / this.movementSpeed);
			this.offsetVec.selfMulScalar(this.offsetMax).selfFloor();
		}
		if (tile == BlockType.POWERUP_LIFE) {
			this.addLife();
		}
		if (tile == BlockType.POWERUP_REMOTE) {
			this.remote = true;
			if (this.remoteSprite === null) {
				this.remoteSprite = new Sprite2D(this.pos.copy(), Images.remote, 3, 7);
				this.main.renderer.addWorldSprite(this.remoteSprite);
			}
		}
		if (tile == BlockType.POWERUP_INVULNERABILITY) {
			this.invulnerable = 30 * 20;
		}
	}
	addLife() {}
	getStats() {
		const stats = {};
		for(const key of this.statProperties) {
			stats[key] = this[key];
		}
		return stats;
	}
	setStats(stats) {
		for(const key of this.statProperties) {
			this[key] = stats[key];
		}
	}
	destroy() {
		if (this.remoteSprite) {
			this.main.renderer.removeWorldSprite(this.remoteSprite);
		}
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