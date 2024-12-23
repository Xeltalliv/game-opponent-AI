import { randomFromArray, randomInt, randomFloat } from "../Utils.mjs";
import { DataLayer } from "../Data/DataLayer.mjs";

export class GameMapGenerator {
	constructor(main) {
		this.main = main;
		this.width = 0;
		this.height = 0;
		this.data = null;
		this.reachable = null;
		this.stage0option = null;
		this.stage1option = null;
		this.stage2option = null;
		this.stage3option = null;
		this.stage4option = null;
	}
	stage0options = [
		"square",
		"rectagle"
	];
	stage1options = [
		"normal",
		"low res",
	];
	stage2options = [
		"fill",
		"random rects",
		"random blocks",
	];
	stage3options = [
		"nothing",
		"middle hole",
		"random block holes",
		"random rect holes",
	];
	stage4options = [
		"mirror x",
		"mirror y",
		"mirror xy",
		"mirror xyq",
		"rotate x",
		"rotate y",
		"rotate xy",
	];
	stage0() {
		const option = randomFromArray(this.stage0options);
		console.log("stage0", option);
		let width, height;
		if (option == "square") {
			width = height = randomInt(6, 15);
		}
		if (option == "rectagle") {
			width = randomInt(7, 15);
			height = randomInt(7, 15);
		}
		this.width = width;
		this.height = height;
		this.stage0option = option;
	}
	stage1() {
		let width = this.width;
		let height = this.height;
		const option = randomFromArray(this.stage1options);
		console.log("stage1", option);
		if (option == "low res") {
			width = Math.floor(width/2);
			height = Math.floor(height/2);
		}
		this.width = width;
		this.height = height;
		this.stage1option = option;
		this.data = new DataLayer(Uint8Array, width, height);
		this.reachable = new DataLayer(Uint8Array, width, height);
	}
	stage2() {
		const width = this.width;
		const height = this.height;
		const option = randomFromArray(this.stage2options);
		console.log("stage2", option);
		if (option == "fill") {
			this.data.fill(0);
		}
		if (option == "random rects") {
			this.data.fill(1);
			const area = width * height * (this.stage1option == "low res" ? 4 : 1);
			const rectCount = Math.ceil(area / 20);
			console.log("rectCount", rectCount);
			for(let i=0; i<rectCount; i++) {
				const x1 = randomInt(0, width-1);
				const x2 = randomInt(0, width-1);
				const y1 = randomInt(0, height-1)
				const y2 = randomInt(0, height-1);
				const min = Math.min;
				const max = Math.max;
				this.fillRect(min(x1,x2), min(y1,y2), max(x1,x2), max(y1,y2), 0);
			}
		}
		if (option == "random blocks") {
			const threshold = 0.8; //this.lowRes ? 0.5 : 0.8;
			for(let y=0; y<height; y++) {
				for(let x=0; x<width; x++) {
					const value = Math.random() < threshold ? 0 : 1;
					this.data.set(x, y, value);
				}
			}
		}
		this.stage3option = option;
	}
	stage3() {
		const width = this.width;
		const height = this.height;
		const option = randomFromArray(this.stage3options);
		console.log("stage3", option);
		if (option == "nothing") {
		}
		if (option == "middle hole") {
			const distance = 0.1;
			const x1 = Math.floor((this.width-1) * (0.5 - distance));
			const x2 = Math.ceil((this.width-1) * (0.5 + distance));
			const y1 = Math.floor((this.height-1) * (0.5 - distance));
			const y2 = Math.ceil((this.height-1) * (0.5 + distance));
			this.fillRect(x1, y1, x2, y2, 1);
		}
		if (option == "random block holes" && this.stage3option !== "random blocks") {
			const threshold = 0.3;
			for(let y=0; y<height; y++) {
				for(let x=0; x<width; x++) {
					if (Math.random() < threshold) this.data.set(x, y, 0);
				}
			}
		}
		if (option == "random rect holes") {
			const area = width * height;
			const rectCount = Math.ceil(area / 30);
			for(let i=0; i<rectCount; i++) {
				const xd = randomInt(1, 3);
				const yd = randomInt(1, 3);
				const xm = randomInt(0, width-1-xd);
				const ym = randomInt(0, height-1-yd);
				const min = Math.min;
				const max = Math.max;
				this.fillRect(xm, ym, xm+xd, ym+yd, 0);
			}
		}
		this.stage3option = option;
	}
	stage4() {
		const stage4chance = 0.5;
		const width = this.width;
		const height = this.height;
		const option = Math.random() < stage4chance ? randomFromArray(this.stage4options) : "nothing";
		console.log("stage4", option);
		if (option == "mirror x") {
			for(let y=0; y<height; y++) {
				for(let x=0; x<width/2; x++) {
					this.data.set(width-1-x, y, this.data.get(x, y));
				}
			}
		}
		if (option == "mirror y") {
			for(let y=0; y<height/2; y++) {
				for(let x=0; x<width; x++) {
					this.data.set(x, height-1-y, this.data.get(x, y));
				}
			}
		}
		if (option == "mirror xy") {
			for(let y=0; y<height/2; y++) {
				for(let x=0; x<width/2; x++) {
					const tile = this.data.get(x, y);
					this.data.set(width-1-x,          y, tile);
					this.data.set(        x, height-1-y, tile);
					this.data.set(width-1-x, height-1-y, tile);
				}
			}
		}
		if (option == "mirror xyq" && this.stage0option == "square") {
			for(let y=0; y<height/2; y++) {
				for(let x=y; x<width/2; x++) {
					const tile = this.data.get(x, y);
					this.data.set(width-1-x,          y, tile);
					this.data.set(        x, height-1-y, tile);
					this.data.set(width-1-x, height-1-y, tile);
					this.data.set(         y,         x, tile);
					this.data.set(         y, width-1-x, tile);
					this.data.set(height-1-y,         x, tile);
					this.data.set(height-1-y, width-1-x, tile);
				}
			}
		}
		if (option == "rotate x") {
			for(let y=0; y<height; y++) {
				for(let x=0; x<width/2; x++) {
					this.data.set(width-1-x, height-1-y, this.data.get(x, y));
				}
			}
		}
		if (option == "rotate y") {
			for(let y=0; y<height/2; y++) {
				for(let x=0; x<width; x++) {
					this.data.set(width-1-x, height-1-y, this.data.get(x, y));
				}
			}
		}
		if (option == "rotate xy" && this.stage0option == "square") {
			for(let y=0; y<height/2; y++) {
				for(let x=0; x<width; x++) {
					const tile = this.data.get(x, y);
					this.data.set(width-1-x, height-1-y, tile);
					this.data.set(        y,  width-1-x, tile);
					this.data.set(height-1-y,         x, tile);
				}
			}
		}
		this.stage4option = option;
	}
	fillInUnreachable() {
		const width = this.width;
		const height = this.height;
		let maxArea = 0;
		let maxId = 0;
		let id = 1;
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				const area = this.markReachable(x, y, id);
				if (area > 0) {
					if (area > maxArea) {
						maxArea = area;
						maxId = id;
					}
					id++;
				}
			}
		}
		for(let y=0; y<height; y++) {
			for(let x=0; x<width; x++) {
				if (this.reachable.get(x, y) !== maxId) {
					this.data.set(x, y, 1);
				}
			}
		}
	}
	markReachable(x, y, value) {
		if (x < 0 || x > this.width-1) return 0;
		if (y < 0 || y > this.height-1) return 0;
		if (this.data.get(x, y) === 1) return 0;
		if (this.reachable.get(x, y) !== 0) return 0;
		this.reachable.set(x, y, value);
		let sum = 1;
		sum += this.markReachable(x+1, y, value);
		sum += this.markReachable(x-1, y, value);
		sum += this.markReachable(x, y+1, value);
		sum += this.markReachable(x, y-1, value);
		return sum;
	}
	upscale() {
		const width = this.width;
		const height = this.height;
		if (this.stage1option == "low res") {
			const data1 = this.data;
			const data2 = new DataLayer(Uint8Array, width*2, height*2);
			for(let y=0, y2=0; y<height; y++, y2+=2) {
				for(let x=0, x2=0; x<width; x++, x2+=2) {
					const tile = data1.get(x, y);
					data2.set(x2, y2, tile);
					data2.set(x2+1, y2, tile);
					data2.set(x2, y2+1, tile);
					data2.set(x2+1, y2+1, tile);
				}
			}
			this.data = data2;
			this.width *= 2;
			this.height *= 2;
		}
	}
	get() {
		this.stage0();
		this.stage1();
		this.stage2();
		this.stage3();
		this.stage4();
		this.fillInUnreachable();
		this.upscale();
		console.log(this.data);
		let row = "";
		for(let y=0; y<this.height; y++) {
			row += "|";
			for(let x=0; x<this.width; x++) {
				if (this.data.get(x, y) === 1) row += "[]";
				else row += "  ";
			}
			row += "|\n";
		}
		console.log(row);
		return this.data;
	}
	fillRect(x1, y1, x2, y2, value) {
		for(let y=y1; y<=y2; y++) {
			for(let x=x1; x<=x2; x++) {
				this.data.set(x, y, value);
			}
		}
	}
}