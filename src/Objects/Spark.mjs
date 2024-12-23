import { Vec2 } from "../Data/Vec2.mjs";
import { Sprite2D } from "../Rendering/Sprite2D.mjs";
import { Images } from "../Rendering/Images.mjs";

export class Spark {
	constructor(main, pos, maxTime) {
		this.main = main;
		this.pos = pos.copy();
		this.anim = 0;
		this.vel = new Vec2(0,0);
		this.time = Math.random() * maxTime;
		this.sprite = new Sprite2D(this.pos, Images.sparks[0], 3, 3);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	velFromSpread(spread) {
		const dir = (Math.random() * 1.8 - 0.9) * spread + Math.PI;
		const speed = Math.random() * (0.5 + 0.4 * (1 - spread)) + 0.1;
		this.velFromDirSpeed(dir, speed);
	}
	velFromDirSpeed(dir, speed) {
		this.vel.x = Math.sin(dir) * speed;
		this.vel.y = Math.cos(dir) * speed;
	}
	loopFrame(dt) {
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