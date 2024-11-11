export class Sprite2D {
	constructor(pos, image, width=16, height=16) {
		this.image = image;
		this.pos = pos;
		this.depth = -pos.y;
		this.width = width;
		this.height = height;
	}
	draw(renderer, ctx, tileSize) {
		ctx.drawImage(this.image, this.pos.x * tileSize - this.width / 2, this.pos.y * tileSize - this.height / 2);
	}
}