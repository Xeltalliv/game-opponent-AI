import { Humanoid } from "./Humanoid.mjs";
import { BlockType, BlockProps } from "../../Map/BlockType.mjs";

export class Player extends Humanoid {
	constructor(main) {
		super(main);
		this.intPos = main.gameMap.getSpawnPos();
		this.updatePosForce(0);
		this.inputManager = main.inputManager;
		this.boundPrimaryAction = this.primaryAction.bind(this);
		this.boundSecondaryAction = this.secondaryAction.bind(this);
		this.boundNextLevel = this.nextLevel.bind(this);
		this.inputManager.getAction("primaryAction").onActionDown(this.boundPrimaryAction);
		this.inputManager.getAction("secondaryAction").onActionDown(this.boundSecondaryAction);
	}
	handleMovement() {
		let moveX = 0, moveY = 0, changeTime = 0;
		const walkLeft = this.inputManager.getAction("walkLeft");
		const walkRight = this.inputManager.getAction("walkRight");
		const walkUp = this.inputManager.getAction("walkUp");
		const walkDown = this.inputManager.getAction("walkDown");
		if (walkLeft.active && walkLeft.changeTime > changeTime && this.checkCanMove(-1, 0)) {
			moveX = -1;
			moveY = 0;
			changeTime = walkLeft.changeTime;
		}
		if (walkRight.active && walkRight.changeTime > changeTime && this.checkCanMove(1, 0)) {
			moveX = 1;
			moveY = 0;
			changeTime = walkRight.changeTime;
		}
		if (walkUp.active && walkUp.changeTime > changeTime && this.checkCanMove(0, -1)) {
			moveX = 0;
			moveY = -1;
			changeTime = walkUp.changeTime;
		}
		if (walkDown.active && walkDown.changeTime > changeTime && this.checkCanMove(0, 1)) {
			moveX = 0;
			moveY = 1;
			changeTime = walkDown.changeTime;
		}
		if (moveX !== 0 && this.offsetVec.y !== 0) {
			moveX = 0;
			moveY = -Math.sign(this.offsetVec.y);
		}
		if (moveY !== 0 && this.offsetVec.x !== 0) {
			moveY = 0;
			moveX = -Math.sign(this.offsetVec.x);
		}
		this.offsetVec.x += moveX;
		this.offsetVec.y += moveY;
		this.isMoving = moveX !== 0 || moveY !== 0;
	}
	onDeathAnimationEnd() {
		this.main.removeLife();
		this.main.restartLevel();
	}
	addLife() {
		this.main.addLife();
	}
	primaryAction() {
		const pos = this.pos.floor();
		if (this.main.gameMap.getTile(pos.x, pos.y) === BlockType.EXIT) {
			this.inputManager.getAction("primaryAction").onActionUp(this.boundNextLevel);
			return false;
		}
		return super.primaryAction();
	}
	nextLevel() {
		this.inputManager.getAction("primaryAction").removeOnActionUp(this.boundNextLevel);
		this.main.nextLevel();
	}
	destroy() {
		this.inputManager.getAction("primaryAction").removeOnActionDown(this.boundPrimaryAction);
		this.inputManager.getAction("secondaryAction").removeOnActionDown(this.boundSecondaryAction);
		super.destroy();
	}
}