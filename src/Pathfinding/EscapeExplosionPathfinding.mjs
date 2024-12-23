import { Vec2 } from "../Data/Vec2.mjs";
import { DataLayer } from "../Data/DataLayer.mjs";
import { BlockProps } from "../Map/BlockType.mjs";

export class EscapeExplosionPathfinding {
	constructor(main) {
		this.map = main.gameMap;
		this.gMap = main.gameMap.pathfinding; //new DataLayer(Uint32Array, this.map.width, this.map.height);
		this.gMap.fill(0xFFFFFFFF);
		this.goalX = 0;
		this.goalY = 0;
		this.goalG = 0xFFFFFFFF;
		//this.map.layerDebug = this.gMap;
	}
	clear(x, y) {
		const exploreList = [];
		this.clearTile(x, y, exploreList);
		while(exploreList.length > 0) {
			const {x, y} = exploreList.shift();
			this.clearTile(x+1, y, exploreList);
			this.clearTile(x-1, y, exploreList);
			this.clearTile(x, y+1, exploreList);
			this.clearTile(x, y-1, exploreList);
		}
	}
	clearTile(x, y, exploreList) {
		if (this.gMap.get(x, y) === 0xFFFFFFFF) return;
		this.gMap.set(x, y, 0xFFFFFFFF);
		exploreList.push({x, y});
	}
	pathfind(fromX, fromY) {
		const exploreList = [];
		this.goalG = 0xFFFFFFFF;
		this.mark(fromX, fromY, 0, exploreList);
		while(exploreList.length > 0) {
			const {x, y, g} = exploreList.shift();
			if (g+1 > this.goalG) break;
			this.mark(x+1, y, g+1, exploreList);
			this.mark(x-1, y, g+1, exploreList);
			this.mark(x, y+1, g+1, exploreList);
			this.mark(x, y-1, g+1, exploreList);
		}
		let returnX = this.goalX;
		let returnY = this.goalY;
		let returnG = 0xFFFFFFFF;
		let returnList = [];
		if (this.gMap.get(returnX, returnY) === 0xFFFFFFFF) {
			this.clear(fromX, fromY);
			return null;
		}
		while(returnX !== fromX || returnY !== fromY) {
			let dx = 0, dy = 0, g = 0;
			g = this.gMap.get(returnX - 1, returnY);
			if (g < returnG) {
				returnG = g;
				dx = -1;
				dy = 0;
			}
			g = this.gMap.get(returnX + 1, returnY);
			if (g < returnG) {
				returnG = g;
				dx = 1;
				dy = 0;
			}
			g = this.gMap.get(returnX, returnY - 1);
			if (g < returnG) {
				returnG = g;
				dx = 0;
				dy = -1;
			}
			g = this.gMap.get(returnX, returnY + 1);
			if (g < returnG) {
				returnG = g;
				dx = 0;
				dy = 1;
			}
			if (dx === 0  && dy === 0) throw new Error("Path error");
			returnX += dx;
			returnY += dy;
			returnList.push(new Vec2(-dx, -dy));
		}
		this.clear(fromX, fromY);
		return returnList;
	}
	mark(x, y, g, exploreList) {
		const props = BlockProps[this.map.getTile(x, y)];
		if (props.solid) return;
		const dt = this.map.getDangerTile(x, y);
		if (dt !== 0 && dt !== 255) return;
		if (this.gMap.get(x, y) < g) return;
		this.gMap.set(x, y, g);
		if (dt === 0) {
			this.goalX = x;
			this.goalY = y;
			this.goalG = g;
		}
		const explore = { x, y, g };
		for(let i=exploreList.length-1; i>=0; i--) {
			if (exploreList[i].g < g) {
				exploreList.splice(i+1, 0, explore);
				return;
			}
		}
		exploreList.unshift(explore);
		return;
	}
}