import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";
import { Images } from "./Images.mjs";

export class BreakingWall {
	constructor(main, pos) {
		this.main = main;
		this.pos = pos.copy();
		this.time = 0.3;
		this.maxTime = 0.3;
		this.sprite = new Sprite2D(this.pos, Images.breaking[2]);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	loop(dt) {
		this.time -= dt;
		const life = this.time / this.maxTime;
		this.sprite.image = Images.breaking[Math.floor(3 * life)];
		if (this.time <= 0) this.destroy();
	}
	destroy() {
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}