import { Vec2 } from "../../Data/Vec2.mjs";
import { Humanoid } from "./Humanoid.mjs";
import { AStarPathfinding } from "../../Pathfinding/AStarPathfinding.mjs";
import { EscapeExplosionPathfinding } from "../../Pathfinding/EscapeExplosionPathfinding.mjs";
import { MinePowerupsPathfinding } from "../../Pathfinding/MinePowerupsPathfinding.mjs";
import { MinePowerupsFarPathfinding } from "../../Pathfinding/MinePowerupsFarPathfinding.mjs";
import { PickupPowerupsPathfinding } from "../../Pathfinding/PickupPowerupsPathfinding.mjs";
import { Sprite2D, Text2D } from "../../Rendering/Sprite2D.mjs";
import { Images } from "../../Rendering/Images.mjs";
import { BlockProps } from "../../Map/BlockType.mjs";

export class Enemy extends Humanoid {
	constructor(main) {
		super(main);
		this.intPos = main.gameMap.getSpawnPos(main.player.intPos);
		this.updatePosForce(0);
		this.move = new Vec2(0,0);
		this.nextTile = new Vec2(0,0);
		this.aStar = new AStarPathfinding(main);
		this.escapeExplosion = new EscapeExplosionPathfinding(main);
		this.minePowerups = new MinePowerupsPathfinding(main);
		this.minePowerupsFar = new MinePowerupsFarPathfinding(main);
		this.pickupPowerups = new PickupPowerupsPathfinding(main);
		this.path = [];
		this.pathSprites = [];

		this.secondaryTask = "none";
		this.hitAWall = false;
		this.followingPath = false;
		this.melee = true;
		this.debugTextPos = new Vec2(0,0);
		this.debugGoal = new Text2D(this.debugTextPos, "Test", "bold 4px sans serif");
		if (this.main.settings.showGoals) {
			this.main.renderer.addWorldSprite(this.debugGoal);
		}
	}
	handleMovement() {
		let moveX = this.move.x, moveY = this.move.y;
		if (!this.checkCanMove(moveX, moveY)) {
			moveX = 0;
			moveY = 0;
			this.hitAWall = true;
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
	loopFrame(dt, time) {
		super.loopFrame(dt, time);
		this.debugTextPos.setVec(this.pos.subScalar(0, 0.5));
	}
	handleAI() {
		if (this.main.gameMap.getDangerTile(this.intPos.x, this.intPos.y) === 255 && this.secondaryTask !== "escape" && this.invulnerable < 100) {
			this.secondaryTask = "none";
			console.log("Lookingg for a new task (In danger)");
		}
		if (this.offsetVec.x === 0 && this.offsetVec.y === 0 && this.nextTile.x === this.intPos.x && this.nextTile.y === this.intPos.y) {
			this.pathNext();
		}
		if (this.hitAWall) {
			this.hitAWall = false;
			this.handleHitAWall();
		}
		if (this.secondaryTask === "none") {
			this.decideWhatToDoNext();
			this.debugGoal.text = this.secondaryTask;
			console.log("Decided to do task", this.secondaryTask);
		}
	}
	pathNext() {
		this.handlePathNext();
		if (this.path.length > 0) {
			const moveVec = this.path.pop();
			const nextTile = this.intPos.add(moveVec)
			if (BlockProps[this.main.gameMap.getTile(nextTile.x, nextTile.y)].kills) {
				this.move.setScalar(0, 0);
				this.secondaryTask = "none";
			} else {
				this.move.setVec(moveVec);
				this.nextTile.setVec(nextTile);
			}
		} else {
			this.move.setScalar(0, 0);
			if (this.followingPath) {
				this.handleArriveAtDestination();
			}
		}
	}
	onDeathAnimationEnd() {
		this.resetPath();
	}
	pathfindTo(x, y) {
		this.setPath(this.aStar.pathfind(this.intPos.x, this.intPos.y, x, y));
	}
	setPath(path, marker) {
		this.clearPathSprites();
		if (path) {
			this.path = path;
			this.followingPath = true;
			this.hitAWall = false;
			//console.log("Path found");
			if (this.main.settings.showPaths) {
				this.showPath(path, marker);
			}
			this.pathNext();
		} else {
			//console.log("Path not found");
		}
	}
	resetPath() {
		this.clearPathSprites();
		this.path = [];
		this.followingPath = false;
		this.hitAWall = false;
	}
	showPath(path, marker="powerup") {
		const image = Images.marker[marker];
		let pos = this.intPos.addScalar(0.5, 0.5);
		for(const dir of path.toReversed()) {
			const sprite1 = new Sprite2D(pos, image, 6, 6);
			const sprite2 = new Sprite2D(pos.add(dir.mulScalar(0.5)), image, 6, 6);
			this.pathSprites.push(sprite1);
			this.pathSprites.push(sprite2);
			this.main.renderer.addWorldSprite(sprite1);
			this.main.renderer.addWorldSprite(sprite2);
			pos = pos.add(dir);
		}
		const sprite1 = new Sprite2D(pos, image, 6, 6);
		this.pathSprites.push(sprite1);
		this.main.renderer.addWorldSprite(sprite1);
	}
	clearPathSprites() {
		for(let sprite of this.pathSprites) {
			this.main.renderer.removeWorldSprite(sprite);
		}
		this.pathSprites = [];
	}
	distanceToPlayer() {
		const pos1 = this.main.player.intPos;
		const pos2 = this.intPos;
		return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
	}
	canKillPlayer() {
		const pos1 = this.main.player.intPos;
		const pos2 = this.intPos;
		return  Math.abs(pos1.x - pos2.x) < this.explosionRange &&
		        Math.abs(pos1.y - pos2.y) < this.explosionRange &&
		        ((pos1.x === pos2.x) || (pos1.y === pos2.y));
	}
	decideWhatToDoNext() {}
	setSecondaryTask(task) {
		if (task == "escape") {
			if (this.invulnerable >= 100) return false;
			if (this.main.gameMap.getDangerTile(this.intPos.x, this.intPos.y) !== 255) return false;
			const path = this.escapeExplosion.pathfind(this.intPos.x, this.intPos.y, this.invulnerable);
			this.secondaryTask = "escape";
			this.setPath(path, "escape");
			return true;
		}
		if (task == "attack") {
			const playerPos = this.main.player.intPos;
			const path = this.aStar.pathfind(this.intPos.x, this.intPos.y, playerPos.x, playerPos.y, this.invulnerable);
			if (!path || (path.length === 0 && !this.canDropBomb())) return false;
			if ((this.isPathUnsafe(path) && !this.canDropBomb())) return false;
			this.secondaryTask = "attack";
			this.setPath(path, "attack");
			return true;
		}
		if (task == "attack melee") {
			const playerPos = this.main.player.intPos;
			const path = this.aStar.pathfind(this.intPos.x, this.intPos.y, playerPos.x, playerPos.y, this.invulnerable);
			if (!path || (path.length === 0 && !this.canDropBomb())) return false;
			if ((this.isPathUnsafe(path) && !this.canDropBomb())) return false;
			this.secondaryTask = "attack melee";
			this.setPath(path, "attack");
			return true;
		}
		if (task == "wait") {
			this.secondaryTask = "wait";
			this.resetPath();
			this.main.onBlockUpdateOnce(this.handleBlockUpdate.bind(this));
			return true;
		}
		if (task == "mine powerups") {
			const path = this.minePowerups.pathfind(this.intPos.x, this.intPos.y, this.explosionRange, this.invulnerable);
			if (!path) return console.log("no path"),false;
			if (path.length === 0 && !this.canDropBomb()) return console.log("path 0"),false;
			if (this.isPathUnsafe(path)) return console.log("path unsafe"),false;
			this.secondaryTask = "mine powerups";
			this.setPath(path, "mine");
			return true;
		}
		if (task == "mine powerups far") {
			const path = this.minePowerupsFar.pathfind(this.intPos.x, this.intPos.y, this.explosionRange, this.invulnerable);
			if (!path) return false;
			if (path.length === 0 && !this.canDropBomb()) return false;
			if (this.isPathUnsafe(path)) return false;
			this.secondaryTask = "mine powerups far";
			this.setPath(path, "mine");
			return true;
		}
		if (task == "pickup powerups") {
			const path = this.pickupPowerups.pathfind(this.intPos.x, this.intPos.y, this.explosionRange, this.invulnerable);
			if (!path || path.length === 0) return false;
			if (this.isPathUnsafe(path)) return false;
			this.secondaryTask = "pickup powerups";
			this.setPath(path, "powerup");
			return true;
		}
		if (task == "remote") {
			if (this.myBombs.length === 0 || !this.remote) return false;
			this.resetPath();
			this.secondaryAction();
			this.secondaryTask = "none";
			return true;
		}
	}
	handleArriveAtDestination() {
		const task = this.secondaryTask;
		if (task === "attack") {
			this.secondaryTask = "none";
		}
		if (task === "attack melee") {
			this.secondaryTask = "none";
		}
		if (task === "escape") {
			this.secondaryTask = "none";
		}
		if (task === "mine powerups") {
			this.primaryAction();
			this.secondaryTask = "none";
		}
		if (task === "mine powerups far") {
			this.primaryAction();
			this.secondaryTask = "none";
		}
		if (task === "pickup powerups") {
			this.secondaryTask = "none";
		}
	}
	handleBlockUpdate() {
		const task = this.secondaryTask;
		if (task == "wait") {
			this.secondaryTask = "none";
		}
	}
	handleHitAWall() {
		const task = this.secondaryTask;
		if (task === "attack") {
			this.primaryAction();
			this.secondaryTask = "none";
		}
		if (task === "attack melee") {
			this.primaryAction();
			this.secondaryTask = "none";
		}
	}
	handlePathNext() {
		const task = this.secondaryTask;
		if (task === "attack") {
			if (this.canKillPlayer()) {
				this.primaryAction();
				this.secondaryTask = "none";
			}
		}
		if (task === "attack melee") {
			if (this.distanceToPlayer() === 0) {
				this.main.player.die();
				this.secondaryTask = "none";
			}
		}
	}
	isPathUnsafe(path) {
		if (path.length > 0) {
			const nextPos = this.intPos.add(path[path.length-1]);
			const nextProps = BlockProps[this.main.gameMap.getTile(nextPos.x, nextPos.y)];
			if (nextProps.solid) return true;
			if (this.invulnerable < 100 && (nextProps.kills || this.main.gameMap.getDangerTile(nextPos.x, nextPos.y) === 255)) {
				return true;
			}
		}
		return false;
	}
	destroy() {
		this.clearPathSprites();
		this.main.renderer.removeWorldSprite(this.debugGoal);
		super.destroy();
	}
}