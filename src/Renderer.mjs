import { Vec2 } from "./Vec2.mjs";
import { Images } from "./Images.mjs";
import { BlockType, BlockProps } from "./BlockType.mjs";

export class Renderer {
	constructor(main) {
		this.main = main;
		this.canvas = document.getElementById("canvas");
		this.resolution = new Vec2(this.canvas.width, this.canvas.height);
		this.ctx = this.canvas.getContext("2d");
		this.camPos = new Vec2(0, 0);
		this.sprites = [];
		this.tileSize = 16;
		this.camPosSeen = new Vec2(0, 0);
		this.screenShake = 0;
		this.camZoom = 4;
		this.worldSprites = [];
	}
	draw(dt) {
		const canvas = this.canvas;
		const ctx = this.ctx;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.imageSmoothingEnabled = false;
		this.resize(canvas);
		this.drawWorld(canvas, ctx);
		this.drawUI(canvas, ctx);
		
		this.camPosSeen.setVec(this.camPos);
		if (this.screenShake > 0) {
			this.camPosSeen.selfAdd(Vec2.randomDir().mulScalar(Math.random() * this.screenShake / this.camZoom));
			this.screenShake *= 0.8;
		}
	}
	drawWorld(canvas, ctx) {
		const gameMap = this.main.gameMap;
		const tileSize = this.tileSize;
		const res = this.resolution;
		const halfRes = res.divScalar(2);
		ctx.save();
		ctx.translate(halfRes.x, halfRes.y);
		const pos1 = this.canvasToWorld(halfRes.neg());
		const pos2 = this.canvasToWorld(halfRes);
		pos1.selfFloor(); //.selfClamp(Vec2.zero, gameMap.size.sub(Vec2.one));
		pos2.selfFloor(); //.selfClamp(Vec2.zero, gameMap.size.sub(Vec2.one));
		const pos3 = pos1.clamp(Vec2.zero, gameMap.size.sub(Vec2.one));
		const pos4 = pos2.clamp(Vec2.zero, gameMap.size.sub(Vec2.one));

		ctx.scale(this.camZoom, this.camZoom);
		ctx.translate(-this.camPosSeen.x * tileSize, -this.camPosSeen.y * tileSize);
		for(let y=pos1.y; y<=pos2.y; y++) {
			for(let x=pos1.x; x<=pos2.x; x++) {
				if (x > -1 && x < gameMap.size.x &&
					y > -1 && y < gameMap.size.y) {
					if (!BlockProps[gameMap.getTile(x, y)].solid) {
						ctx.drawImage(Images.tiles[0], x*tileSize, y*tileSize);
						const tile1 = x > 0 ? BlockProps[gameMap.getTile(x - 1, y)].solid : true;
						const tile2 = x > 0 && y > 0 ? BlockProps[gameMap.getTile(x - 1, y - 1)].solid : true;
						const tile3 = y > 0 ? BlockProps[gameMap.getTile(x, y - 1)].solid : true;
						const shadow = tile1 + tile2*2 + tile3*4;
						if (shadow > 0) ctx.drawImage(Images.tileShadows[shadow], x*tileSize, y*tileSize);
					}
				} else {
					ctx.drawImage(Images.tileEdge, x*tileSize, y*tileSize);
				}
			}
		}
		for(let y=pos3.y; y<=pos4.y; y++) {
			for(let x=pos3.x; x<=pos4.x; x++) {
				const tile = gameMap.getTile(x, y);
				if (tile > 0) {
					ctx.drawImage(Images.tiles[tile], x*tileSize, y*tileSize);
				}
			}
		}
		this.worldSprites.sort((a,b) => b.depth - a.depth);
		for(const sprite of this.worldSprites) {
			sprite.draw(this, ctx, tileSize);
		}
		ctx.restore();
	}
	drawUI(canvas, ctx) {
		ctx.font = "bold 48px sans serif";
		ctx.fillText("Lives: "+this.main.stats.lives, 20, 48*1);
		ctx.fillText("Level: "+this.main.stats.level, 20, 48*2);
		ctx.fillText("Score: "+this.main.stats.score, 20, 48*3);
	}
	canvasToWorld(v) {
		return v.divScalar(this.tileSize * this.camZoom).add(this.camPosSeen);
	}
	worldToCanvas(v) {
		return v.sub(this.camPosSeen).mulScalar(this.tileSize * this.camZoom);
	}
	addWorldSprite(sprite) {
		this.worldSprites.push(sprite);
	}
	removeWorldSprite(sprite) {
		const index = this.worldSprites.indexOf(sprite);
		if (index > -1) this.worldSprites.splice(index, 1);
	}
	resize(canvas) {
		const displayWidth  = Math.floor(canvas.clientWidth  * window.devicePixelRatio);
		const displayHeight = Math.floor(canvas.clientHeight * window.devicePixelRatio);
		if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
			canvas.width  = this.resolution.x = displayWidth;
			canvas.height = this.resolution.y = displayHeight;
		}
	}
}