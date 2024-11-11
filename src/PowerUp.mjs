import { Vec2 } from "./Vec2.mjs";
import { Sprite2D } from "./Sprite2D.mjs";

export class PowerUp {
	constructor(main, pos, image, powerupStat, powerupValue) {
		this.main = main;
		this.pos = pos.copy();
		this.posVisual = pos.copy();
		this.powerupStat = powerupStat;
		this.powerupValue = powerupValue;
		this.anim = 0;
		this.sprite = new Sprite2D(this.posVisual, image);
		this.main.renderer.addWorldSprite(this.sprite);
		this.main.addObject(this);
	}
	loop(dt) {
		this.anim += dt * 3;
		this.posVisual.y = this.pos.y + Math.sin(this.anim) * 0.1;
		if (this.pos.distance(this.main.player.pos) < 0.5) {
			this.main.stats[this.powerupStat] += this.powerupValue;
			this.destroy();
		}
	}
	destroy() {
		this.main.renderer.removeWorldSprite(this.sprite);
		this.main.removeObject(this);
	}
}