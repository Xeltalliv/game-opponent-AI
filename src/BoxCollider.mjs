import { Vec2 } from "./Vec2.mjs";
import { BlockProps } from "./BlockType.mjs";

export class BoxCollider {
	constructor(halfSize) {
		this.halfSize = halfSize;
	}
	check(pos, gameMap, property="solid") {
		const pos1 = pos.sub(this.halfSize);
		const pos2 = pos.add(this.halfSize);
		pos1.selfFloor().selfClamp(Vec2.zero, gameMap.size.sub(Vec2.one));
		pos2.selfFloor().selfClamp(Vec2.zero, gameMap.size.sub(Vec2.one));

		for(let y=pos1.y; y<=pos2.y; y++) {
			for(let x=pos1.x; x<=pos2.x; x++) {
				if (BlockProps[gameMap.getTile(x, y)][property]) return true;
			}
		}
		return false;
	}
}