export class Vec2 {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}
	static zero = new Vec2(0,0);
	static one = new Vec2(1,1);
	add(v) {
		return new Vec2(
			this.x + v.x,
			this.y + v.y
		);
	}
	selfAdd(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	addScalar(x, y) {
		return new Vec2(
			this.x + x,
			this.y + y
		);
	}
	selfAddScalar(x, y) {
		this.x += x;
		this.y += y;
		return this;
	}
	sub(v) {
		return new Vec2(
			this.x - v.x,
			this.y - v.y
		);
	}
	selfSub(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}
	subScalar(x, y) {
		return new Vec2(
			this.x - x,
			this.y - y
		);
	}
	selfTwoScalar(x, y) {
		this.x -= x;
		this.y -= y;
		return this;
	}
	mulVec(v) {
		return new Vec2(
			this.x * v.x,
			this.y * v.y
		);
	}
	selfMulVec(v) {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	}
	divVec(v) {
		return new Vec2(
			this.x / v.x,
			this.y / v.y
		);
	}
	selfDivVec(v) {
		this.x /= v.x;
		this.y /= v.y;
		return this;
	}
	mulScalar(s) {
		return new Vec2(
			this.x * s,
			this.y * s
		);
	}
	selfMulScalar(s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
	divScalar(s) {
		return new Vec2(
			this.x / s,
			this.y / s
		);
	}
	selfDivScalar(s) {
		this.x /= s;
		this.y /= s;
		return this;
	}
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	lengthSqr() {
		return this.x * this.x + this.y * this.y;
	}
	distance(v) {
		const dx = this.x - v.x;
		const dy = this.y - v.y
		return Math.sqrt(dx * dx + dy * dy);
	}
	floor(v) {
		return new Vec2(
			Math.floor(this.x),
			Math.floor(this.y)
		);
	}
	selfFloor(v) {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}
	ceil(v) {
		return new Vec2(
			Math.ceil(this.x),
			Math.ceil(this.y)
		);
	}
	selfCeil(v) {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}
	round() {
		return new Vec2(
			Math.round(this.x),
			Math.round(this.y)
		);
	}
	selfRound() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}
	neg() {
		return new Vec2(
			-this.x,
			-this.y
		);
	}
	selfNeg() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}
	inv() {
		return new Vec2(
			1 / this.x,
			1 / this.y
		);
	}
	selfInv() {
		this.x = 1 / this.x;
		this.y = 1 / this.y;
		return this;
	}
	copy() {
		return new Vec2(
			this.x,
			this.y
		);
	}
	min(v) {
		return new Vec2(
			Math.min(this.x, v.x),
			Math.min(this.y, v.y)
		);
	}
	selfMin(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		return this;
	}
	max(v) {
		return new Vec2(
			Math.max(this.x, v.x),
			Math.max(this.y, v.y)
		);
	}
	selfMax(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		return this;
	}
	clamp(min, max) {
		return new Vec2(
			Math.min(Math.max(this.x, min.x), max.x),
			Math.min(Math.max(this.y, min.y), max.y)
		);
	}
	selfClamp(min, max) {
		this.x = Math.min(Math.max(this.x, min.x), max.x);
		this.y = Math.min(Math.max(this.y, min.y), max.y);
		return this;
	}
	setScalar(x, y) {
		this.x = x;
		this.y = y;
	}
	setVec(v) {
		this.x = v.x;
		this.y = v.y;
	}
	clear() {
		this.x = 0;
		this.y = 0;
	}
	static random01() {
		return new Vec2(
			Math.random(),
			Math.random(),
		);
	}
	static random11() {
		return new Vec2(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
		);
	}
	static randomDir() {
		const dir = Math.random() * Math.PI * 2;
		return new Vec2(
			Math.sin(dir),
			Math.cos(dir),
		);
	}
}