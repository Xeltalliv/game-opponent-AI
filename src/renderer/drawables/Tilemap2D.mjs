export class Tilemap2D {
	constructor() {
		this.width = 0;
		this.height = 0;
		this.map = null;
		this.images = [];
	}
	addImage(src) {
		const img = new Image();
		img.src = src;
		this.images.push(img);
	}
	setMap(map) {
		this.width = map[0].length;
		this.height = map.length;
		this.map = map;
	}
	draw(renderer, ctx) {
		for(let x=0; x<this.width; x++) {
			for(let y=0; y<this.height; y++) {
				ctx.drawImage(this.images[this.map[y][x]], x, y, 1, 1);
			}
		}
	}
}