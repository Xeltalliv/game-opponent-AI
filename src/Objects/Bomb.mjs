import { Vec2 } from "../Data/Vec2.mjs";
import { Sprite2D } from "../Rendering/Sprite2D.mjs";
import { Images } from "../Rendering/Images.mjs";
import { Explosion } from "./Explosion.mjs";
import { Spark } from "./Spark.mjs";

export class Bomb {
	constructor(main, pos, time, explosionRange, player) {
		this.main = main;
		this.pos = pos.copy();
		this.owner = player;
		this.explosionRange = explosionRange;
		this.time = time;
		this.maxTime = time;
		this.anim = 0;
		this.sprite = new Sprite2D(this.pos, Images.bomb[5]);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
		this.dangerChanges = [];
		this.markDanger();
		this.main.sfx.play(this.main.sfx.sounds.placeBomb);
		this.fuseSfx = this.main.sfx.play(this.main.sfx.sounds.fuse);
	}
	loopFrame(dt) {}
	loopFixed(dt, time, tick) {
		this.time--;
		const life = this.time / this.maxTime
		if (tick % 2) {
			const spark = new Spark(this.main, this.pos.add(new Vec2(life * 0.1, -0.25 - life * 0.2)), 1);
			spark.velFromSpread(Math.sqrt(Math.max(0, life - 0.2)));
		}
		this.sprite.image = Images.bomb[Math.floor(6 * life)];
		if (this.time <= 0) this.explode();
	}
	explode() {
		for(let i=0; i<100; i++) {
			const spark = new Spark(this.main, this.pos, 0.3);
			spark.velFromDirSpeed(Math.random() * 2 * Math.PI, 10 + Math.random() * 6);
		}
		this.unmarkDanger(true);
		new Explosion(this.main, this.pos, this.explosionRange);
		this.destroy();
	}
	destroy() {
		this.owner.removeBomb(this);
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
		this.main.remarkDanger();
		this.fuseSfx.stop();
	}
	markDanger() {
		const map = this.main.gameMap;
		let x = Math.floor(this.pos.x);
		let y = Math.floor(this.pos.y);
		map.setDangerTile(x, y, 255);

		const dirs = [
			{dx: -1, dy:  0},
			{dx:  1, dy:  0},
			{dx:  0, dy: -1},
			{dx:  0, dy:  1},
		];
		const length = this.explosionRange;
		for(let {dx, dy} of dirs) {
			let x = Math.floor(this.pos.x);
			let y = Math.floor(this.pos.y);
			let added = false;
			for(let i=0; i<length; i++) {
				x += dx;
				y += dy;
				const tile = map.getDangerTile(x, y);
				if (tile == 2) {
					this.dangerChanges.push({length:i, destroyed:false, dx, dy});
					added = true;
					break;
				}
				if (tile == 1) {
					map.setDangerTile(x, y, 0);
					this.dangerChanges.push({length:i, destroyed:true, dx, dy});
					added = true;
					break;
				}
				map.setDangerTile(x, y, 255);
			}
			if (!added) {
				this.dangerChanges.push({length, destroyed:false, dx, dy});
			}
		}
	}
	unmarkDanger(apply) {
		const map = this.main.gameMap;
		let x = Math.floor(this.pos.x);
		let y = Math.floor(this.pos.y);
		if (map.getDangerTile(x, y) === 255) {
			map.setDangerTile(x, y, 0);
		}

		for(let {length, destroyed, dx, dy} of this.dangerChanges) {
			let x = Math.floor(this.pos.x);
			let y = Math.floor(this.pos.y);
			for(let i=0; i<length; i++) {
				x += dx;
				y += dy;
				if (map.getDangerTile(x, y) === 255) {
					map.setDangerTile(x, y, 0);
				}
			}
			if (destroyed && !apply) {
				map.setDangerTile(x + dx, y + dy, 1);
			}
		}
		this.dangerChanges = [];
	}
}