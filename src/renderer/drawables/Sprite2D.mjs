export class Sprite2D {
	constructor(x, y, src) {
		this.image = new Image();
		this.image.src = src;
		this.x = x;
		this.y = y;
		this.depth = 0;
	}
	draw(renderer, ctx) {
		ctx.drawImage(this.image, this.x, this.y, 1, 1);
	}
}