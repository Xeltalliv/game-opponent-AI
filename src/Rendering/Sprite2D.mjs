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
export class TintedSprite2D extends Sprite2D {
	constructor(pos, image, width, height) {
		super(pos, image, width, height);
		this.filter = "none";
	}
	setFilter(filter) {
		this.filter = filter;
	}
	draw(renderer, ctx, tileSize) {
		ctx.filter = this.filter;
		super.draw(renderer, ctx, tileSize);
		ctx.filter = "none";
	}
}
export class Text2D {
	constructor(pos, text, font) {
		this.text = text;
		this.pos = pos;
		this.depth = -pos.y;
		this.font = font;
	}
	draw(renderer, ctx, tileSize) {
		ctx.font = this.font;
		ctx.fillText(this.text, this.pos.x * tileSize, this.pos.y * tileSize);
	}
}