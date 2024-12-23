import { Vec2 } from "../Data/Vec2.mjs";
import { DataLayer } from "../Data/DataLayer.mjs";
import { BlockProps } from "../Map/BlockType.mjs";

export class AStarPathfinding {
	constructor(main) {
		this.map = main.gameMap;
		this.gMap = main.gameMap.pathfinding; //new DataLayer(Uint32Array, this.map.width, this.map.height);
		this.gMap.fill(0xFFFFFFFF);
		this.goalX = 0;
		this.goalY = 0;
		this.invulnerable = 0;
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
	pathfind(fromX, fromY, toX, toY, invulnerable) {
		this.invulnerable = invulnerable;
		this.goalX = toX;
		this.goalY = toY;
		const exploreList = [];
		this.mark(fromX, fromY, 0, exploreList);
		while(exploreList.length > 0) {
			const {x, y, f, g} = exploreList.shift();
			this.mark(x+1, y, g+1, exploreList) ||
			this.mark(x-1, y, g+1, exploreList) ||
			this.mark(x, y+1, g+1, exploreList) ||
			this.mark(x, y-1, g+1, exploreList);
		}
		let returnX = toX;
		let returnY = toY;
		let returnG = 0xFFFFFFFF;
		let returnList = [];
		if (this.gMap.get(toX, toY) === 0xFFFFFFFF) {
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
			returnX += dx;
			returnY += dy;
			returnList.push(new Vec2(-dx, -dy));
		}
		this.clear(fromX, fromY);
		return returnList;
	}
	mark(x, y, g, exploreList) {
		const props = BlockProps[this.map.getTile(x, y)];
		if (props.solid) {
			if (props.destroyable) g += 20;
			else return;
		}
		if (this.gMap.get(x, y) < g) return;
		if (this.map.getDangerTile(x, y) === 255 && this.invulnerable < 100) return;
		const h = Math.abs(x - this.goalX) + Math.abs(y - this.goalY);
		this.gMap.set(x, y, g);
		if (h === 0) {
			exploreList.length = 0;
			return true;
		}
		const f = g + h;
		const explore = { x, y, g, f };
		for(let i=0; i<exploreList.length; i++) {
			if (exploreList[i].f > f) {
				exploreList.splice(i, 0, explore);
				return;
			}
		}
		exploreList.push(explore);
	}
}