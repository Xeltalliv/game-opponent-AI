import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";
import { Images } from "./Images.mjs";
import { Explosion } from "./Explosion.mjs";
import { Spark } from "./Spark.mjs";

export class Bomb {
	constructor(main, pos, time, maxTime, player) {
		this.main = main;
		this.pos = pos.copy();
		this.owner = player;
		this.time = time;
		this.maxTime = maxTime;
		this.anim = 0;
		this.sprite = new Sprite2D(this.pos, Images.bomb[5]);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	loop(dt) {
		this.time -= dt;
		const life = this.time / this.maxTime
		this.anim += dt;
		if (this.anim > 0.1) {
			this.anim = this.anim % 0.1;
			new Spark(this.main, this.pos.add(new Vec2(life * 0.1, -0.25 - life * 0.2)), Math.sqrt(Math.max(0, life - 0.2)));
		}
		this.sprite.image = Images.bomb[Math.floor(6 * life)];
		if (this.time <= 0) this.explode();
	}
	explode() {
		new Explosion(this.main, this.pos);
		this.destroy();
	}
	destroy() {
		this.owner.removeBomb(this);
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}