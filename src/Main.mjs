import { Renderer } from "./Renderer.mjs";
import { GameMap } from "./GameMap.mjs";
import { InputManager } from "./InputManager.mjs";
import { Player } from "./Player.mjs";
import GUI from "./lil-gui.esm.js";


export class Main {
	constructor() {
		this.gui = new GUI();
		this.renderer = new Renderer(this);
		this.gameMap = null;
		this.inputManager = new InputManager(this);
		this.inputManager.defineAction("walkUp", ["KeyW", "ArrowUP"]);
		this.inputManager.defineAction("walkDown", ["KeyS", "ArrowDown"]);
		this.inputManager.defineAction("walkLeft", ["KeyA", "ArrowLeft"]);
		this.inputManager.defineAction("walkRight", ["KeyD", "ArrowRight"]);
		this.inputManager.defineAction("primaryAction", ["KeyE", "Space"]);
		this.inputManager.defineAction("skipLevel", ["KeyT"]);
		this.debug = {
			lockCameraY: true,
			camFollowPlayer: true,
		};
		this.stats = null;
		this.objects = [];
		this.player = null;
		this.lastTime = performance.now();
		this.boundLoop = this.loop.bind(this);
		this.gui.add(this.renderer.camPos, "x", -10, 100);
		this.gui.add(this.renderer.camPos, "y", -10, 100);
		this.gui.add(this.renderer, "camZoom", 0.5, 5);
		this.gui.add(this.debug, "lockCameraY");
		this.gui.add(this.debug, "camFollowPlayer");
		this.inputManager.getAction("skipLevel").onActionDown(() => this.nextLevel());
		this.restartGame();
		this.stats.lives++;
		this.restartLevel();
	}
	loadLevel() {
		for(const object of this.objects.slice()) {
			if (object.destroy) object.destroy();
		}
		this.gameMap = new GameMap(this, 31, 13);
		this.player = new Player(this);
	}
	init() {
		this.loop();
	}
	loop() {
		const currTime = performance.now();
		const dt = (currTime - this.lastTime) / 1000;
		this.lastTime = currTime;

		this.step(dt);
		this.renderer.draw(dt);
		requestAnimationFrame(this.boundLoop);
	}
	step(dt) {
		for(const object of this.objects) {
			object.loop(dt);
		}
		//this.player.loop(dt);
		if (this.debug.camFollowPlayer) this.renderer.camPos.selfAdd(this.player.pos.sub(this.renderer.camPos).divScalar(10));
		if (this.debug.lockCameraY) this.renderer.camPos.y = 6.5;
		//console.log(this.inputManager.getAction("walkUp").active);
	}
	addObject(object) {
		this.objects.push(object);
	}
	removeObject(object) {
		const index = this.objects.indexOf(object);
		if (index > -1) this.objects.splice(index, 1);
	}
	nextLevel() {
		this.stats.level++;
		this.loadLevel();
	}
	restartLevel() {
		this.stats.lives--;
		if (this.stats.lives < 0) {
			this.restartGame();
		}
		this.loadLevel();
	}
	restartGame() {
		this.stats = {
			score: 0,
			level: 1,
			maxBombs: 1,
			explosionRange: 1,
			movementSpeed: 3,
			lives: 3,
		};
	}
}