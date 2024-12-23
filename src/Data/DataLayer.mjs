export class DataLayer {
	constructor(type, w, h) {
		this.width = w;
		this.height = h;
		this.data = new type(w*h);
		this.defaultValue = 0;
	}
	get(x, y) {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return this.defaultValue;
		return this.data[y * this.width + x];
	}
	getFast(x, y) {
		return this.data[y * this.width + x];
	}
	set(x, y, value) {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
		this.data[y * this.width + x] = value;
	}
	setFast(x, y, value) {
		this.data[y * this.width + x] = value;
	}
	fill(value) {
		this.data.fill(value);
	}
}