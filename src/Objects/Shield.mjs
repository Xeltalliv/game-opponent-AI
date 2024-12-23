import { Vec2 } from "../Data/Vec2.mjs";
import { Sprite2D } from "../Rendering/Sprite2D.mjs";
import { Images } from "../Rendering/Images.mjs";

export class Shield {
	constructor(main, pos, maxTime) {
		this.main = main;
		this.pos = pos.copy();
		this.vel = new Vec2(0,0);
		this.time = Math.random() * maxTime;
		this.maxTime = this.time;
		this.sprite = new Sprite2D(this.pos, Images.shield[2], 5, 5);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	velFromDirSpeed(dir, speed) {
		this.vel.x = Math.sin(dir) * speed;
		this.vel.y = Math.cos(dir) * speed;
	}
	loopFrame(dt) {
		this.time -= dt;
		this.sprite.image = Images.shield[Math.min(2, Math.floor(this.time / this.maxTime * 6))];
		this.pos.selfAdd(this.vel.mulScalar(dt));
		if (this.time <= 0) this.destroy();
	}
	destroy() {
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}