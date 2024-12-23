import { Vec2 } from "./Vec2.mjs";

export class InterpolatedScalar {
	constructor() {
		this.oldValue = 0;
		this.newValue = 0;
		this.oldTime = -2;
		this.newTime = -1;
	}
	set(value, time) {
		if (time > this.newTime) {
			this.oldValue = this.newValue;
			this.oldTime = this.newTime;
			this.newValue = value;
			this.newTime = time;
		}
	}
	get(time) {
		const t = (t - this.newTime) / (this.newTime - this.oldTime);
		return this.oldValue + (this.newValue - this.oldValue) * t;
	}
}
export class InterpolatedVec2 {
	constructor() {
		this.oldX = 0;
		this.newX = 0;
		this.oldY = 0;
		this.newY = 0;
		this.oldTime = -2;
		this.newTime = -1;
		this.outVec = new Vec2(0,0);
	}
	setVec(value, time) {
		if (time > this.newTime) {
			this.oldX = this.newX;
			this.oldY = this.newY;
			this.oldTime = this.newTime;
			this.newX = value.x;
			this.newY = value.y;
			this.newTime = time;
		}
	}
	setVecForce(value, time) {
		this.oldX = value.x;
		this.oldY = value.y;
		this.oldTime = time-1;
		this.newX = value.x;
		this.newY = value.y;
		this.newTime = time;
	}
	get(time) {
		const t = (time - this.newTime) / (this.newTime - this.oldTime);
		this.outVec.x = this.oldX + (this.newX - this.oldX) * t;
		this.outVec.y = this.oldY + (this.newY - this.oldY) * t;
		return this.outVec;
	}
}