import { Renderer } from "./Rendering/Renderer.mjs";
import { GameMap } from "./Map/GameMap.mjs";
import { InputManager } from "./InputManager.mjs";
import { Player } from "./Objects/Humanoids/Player.mjs";
import { Enemy } from "./Objects/Humanoids/Enemy.mjs";
import { AggressiveEnemy, AggressiveMeleeEnemy, LevelupEnemy, ScaredEnemy } from "./Objects/Humanoids/EnemyTypes.mjs";
import { Bomb } from "./Objects/Bomb.mjs";
import { GameMapGenerator } from "./Map/GameMapGenerator.mjs";
import { randomFromArray } from "./Utils.mjs";
import { SfxManager } from "./Audio/SfxManager.mjs";
import { DialogManager, MainMenuDialog } from "./Dialogs/Dialogs.mjs";
import { Vec2 } from "./Data/Vec2.mjs";

import GUI from "./Libs/lil-gui.esm.js";

export class Main {
	constructor() {
		this.renderer = new Renderer(this);
		this.sfx = new SfxManager(this);
		this.dialogManager = new DialogManager(this);
		this.gameMap = null;
		this.inputManager = new InputManager(this);
		this.inputManager.defineAction("walkUp", ["KeyW", "ArrowUP"]);
		this.inputManager.defineAction("walkDown", ["KeyS", "ArrowDown"]);
		this.inputManager.defineAction("walkLeft", ["KeyA", "ArrowLeft"]);
		this.inputManager.defineAction("walkRight", ["KeyD", "ArrowRight"]);
		this.inputManager.defineAction("primaryAction", ["KeyE", "Space"]);
		this.inputManager.defineAction("secondaryAction", ["KeyQ", "Enter"]);
		this.inputManager.defineAction("skipLevel", ["KeyT"]);
		this.inputManager.defineAction("exitToMainMenu", ["Escape"]);
		this.settings = {
			sound: true,
			music: true,
			screenShake: true,
			viewBob: true,
			showPaths: false,
			showGoals: false,
			debugMenu: false,
			debugViewMode: "none",
			debugViewRange: 1,
			lockCameraY: false,
			camFollowPlayer: true,
			powerupsPerLevel: 6,
		};
		this.loadSettings();
		this.state = "";
		this.gui = null;
		this.tick = 0;
		this.tickRate = 20;
		this.lives = 3;
		this.level = 1;
		this.score = 0;
		this.objects = [];
		this.player = null;
		this.enemies = [];
		this.onBlockUpdateOnceCbs = [];
		this.lastTime = performance.now();
		this.boundLoop = this.loop.bind(this);
		this.inputManager.getAction("skipLevel").onActionDown(() => this.nextLevel());
		this.inputManager.getAction("exitToMainMenu").onActionDown(() => {
			if (this.state !== "menu") this.loadMenu();
		});
		this.loadMenu();
		this.music = null;
	}
	saveSettings() {
		localStorage.setItem("gameAILab", JSON.stringify(this.settings));
	}
	loadSettings() {
		const data = localStorage.getItem("gameAILab");
		if (!data) return;
		Object.assign(this.settings, JSON.parse(data));
	}
	addGui() {
		const gui = new GUI({closeFolders: true, title:"Debug menu"});
		const camera = gui.addFolder("Camera");
		camera.add(this.renderer.camPos, "x", -10, 100);
		camera.add(this.renderer.camPos, "y", -10, 100);
		camera.add(this.renderer, "camZoom", 0.5, 5);
		camera.add(this.settings, "lockCameraY");
		camera.add(this.settings, "camFollowPlayer");
		const debugView = gui.addFolder("Debug View");
		debugView.add(this.settings, "showPaths");
		debugView.add(this.settings, "debugViewMode", ["none", "danger", "reach", "reachX+", "reachX-", "reachY+", "reachY-"]);
		debugView.add(this.settings, "debugViewRange", 1, 8, 1);
		gui.add(this, "nextLevel");
		gui.add(this, "restartLevel");
		gui.add(this, "addLife");
		this.gui = gui;
	}
	destroyAllObjects() {
		for(const object of this.objects.slice()) {
			if (object.destroy) object.destroy();
		}
		this.player = null;
	}
	loadMenu() {
		this.state = "menu";
		this.destroyAllObjects();
		this.gameMap = new GameMap(this);
		this.gameMap.initMapSimple(9, 9, 0);
		this.gameMap.postPrepare();
		this.dialogManager.add(new MainMenuDialog());
	}
	loadLevel() {
		this.state = "level";
		if (!this.music && this.settings.music) {
			this.music = this.sfx.play(this.sfx.sounds.music);
			this.music.loop();
		}
		if (!this.gui && this.settings.debugMenu) {
			this.addGui();
		}
		this.destroyAllObjects();
		this.gameMap = new GameMap(this);
		this.gameMap.initMapSimple(31, 13, this.settings.powerupsPerLevel);
		//const gmg = new GameMapGenerator();
		//this.gameMap.initMapFromGMG(gmg.get());

		this.player = new Player(this);
		const enemyTypes = [AggressiveEnemy, AggressiveMeleeEnemy, LevelupEnemy, ScaredEnemy];
		this.enemies = [];
		for(let i=0; i<this.level; i++) {
			const enemyType = randomFromArray(enemyTypes);
			this.enemies.push(new enemyType(this));
		}

		this.gameMap.postPrepare();
	}
	init() {
		this.loop();
	}
	loop() {
		const currTime = performance.now();
		const dt = (currTime - this.lastTime) / 1000;
		const tickTarget = Math.floor(currTime / 1000 * this.tickRate);
		const tickCount = Math.min(tickTarget - this.tick, 5);
		this.lastTime = currTime;

		this.step(dt, tickCount);
		this.tick = tickTarget;
		this.renderer.draw(dt);
		requestAnimationFrame(this.boundLoop);
	}
	step(dt, tickCount) {
		if (!this.gameMap) return;
		const fixedDt = 1 / this.tickRate;
		for(let i=0; i<tickCount; i++) {
			this.tick++;
			const fixedTime = this.tick / this.tickRate;
			for(const object of this.objects) {
				if (object.loopFixed) object.loopFixed(fixedDt, fixedTime, this.tick);
			}
		}
		for(const object of this.objects) {
			if (object.loopFrame) object.loopFrame(dt, this.lastTime / 1000);
		}
		if (this.settings.camFollowPlayer) {
			let targetZoom;
			let targetPos;
			let followDiv = 20;
			if (this.player) {
				let length;
				if (this.settings.lockCameraY) {
					length = Math.abs(this.player.pos.x - this.renderer.camPos.x);
				} else {
					length = this.player.pos.sub(this.renderer.camPos).length();
				}
				followDiv = this.player.dead ? 20 : 10;
				targetPos = this.player.pos;
				targetZoom = !this.player.dead && length < 1 ? 4 : 2;
			} else {
				targetPos = this.gameMap.size.mulScalar(0.5);
				targetZoom = 6;
			}
			this.renderer.camPos.selfAdd(targetPos.sub(this.renderer.camPos).divScalar(followDiv));
			this.renderer.camZoom += (targetZoom - this.renderer.camZoom) / 20;
		} else {
			this.controlCamera(dt);
		}
		if (this.settings.lockCameraY && this.state === "level") this.renderer.camPos.y = 6.5;
	}
	controlCamera(dt) {
		const move = new Vec2(0,0);
		const walkLeft = this.inputManager.getAction("walkLeft");
		const walkRight = this.inputManager.getAction("walkRight");
		const walkUp = this.inputManager.getAction("walkUp");
		const walkDown = this.inputManager.getAction("walkDown");
		if (walkLeft.active) move.x--;
		if (walkRight.active) move.x++;
		if (walkUp.active) move.y--;
		if (walkDown.active) move.y++;
		this.renderer.camPos.selfAdd(move.mulScalar(5 * dt));
	}
	addObject(object) {
		this.objects.push(object);
	}
	removeObject(object) {
		const index = this.objects.indexOf(object);
		if (index > -1) this.objects.splice(index, 1);
	}
	nextLevel() {
		const stats = this.player.getStats();
		this.level++;
		this.loadLevel();
		this.player.setStats(stats);
	}
	restartLevel() {
		const stats = this.player ? this.player.getStats() : null;
		if (this.lives < 0) {
			this.restartGame();
			this.loadLevel();
		} else {
			this.loadLevel();
			if (stats) this.player.setStats(stats);
		}
	}
	restartGame() {
		this.score = 0;
		this.level = 1;
		this.lives = 3;
	}
	removeLife() {
		if (this.level > 1 && this.lives > 0) this.lives--;
	}
	addLife() {
		this.lives++;
	}
	remarkDanger() {
		const bombs = [];
		for(const object of this.objects) {
			if (object instanceof Bomb) {
				bombs.push({bomb: object, time: object.timeMax-object.time});
			}
		}
		bombs.sort((a,b) => a.time - b.time);
		for(const bomb of bombs) {
			bomb.bomb.unmarkDanger();
		}
		for(const bomb of bombs) {
			bomb.bomb.markDanger();
		}
	}
	onBlockUpdateOnce(callback) {
		this.onBlockUpdateOnceCbs.push(callback);
	}
	notifyBlockUpdate() {
		this.gameMap.updateRangeMap(this.gameMap.width, this.gameMap.height);
		for(const callback of this.onBlockUpdateOnceCbs) {
			callback();
		}
		this.onBlockUpdateOnceCbs = [];
	}
}