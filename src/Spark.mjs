import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";
import { Images } from "./Images.mjs";

export class Spark {
	constructor(main, pos, focus) {
		this.main = main;
		this.pos = pos.copy();
		this.anim = 0;
		const dir = (Math.random() * 1.8 - 0.9) * focus + Math.PI;
		const speed = Math.random() * (0.5 + 0.4 * (1 - focus)) + 0.1;
		this.vel = new Vec2(Math.sin(dir) * speed, Math.cos(dir) * speed);
		this.time = Math.random();
		this.sprite = new Sprite2D(this.pos, Images.sparks[0], 3, 3);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	loop(dt) {
		this.anim += dt;
		if (this.anim > 0.2) {
			this.anim = this.anim % 0.2;
			this.sprite.image = Images.sparks[Math.floor(Math.random() * Images.sparks.length)];
		}
		this.time -= dt;
		this.pos.selfAdd(this.vel.mulScalar(dt));
		if (this.time <= 0) this.destroy();
	}
	destroy() {
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}