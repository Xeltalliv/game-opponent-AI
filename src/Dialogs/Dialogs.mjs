import { getMainInstance } from "../mainInstance.mjs";

export class DialogManager {
	constructor() {
		this.dialogHolder = document.getElementById("dialogHolder");
		this.curtain = document.createElement("div");
		this.curtain.classList.add("dialogCutain");
		this.curtain.addEventListener("click", () => {
			const dialog = this.getLastDialog();
			if (dialog.dismissable) this.remove(dialog);
		});
		this.dialogs = [];
	}
	add(dialog) {
		this.dialogs.push(dialog);
		this.dialogHolder.appendChild(dialog.el);
		this.update();
	}
	remove(dialog) {
		const index = this.dialogs.indexOf(dialog);
		if (index > -1) this.dialogs.splice(index, 1); 
		this.dialogHolder.removeChild(dialog.el);
		this.update();
	}
	getLastDialog() {
		return this.dialogs[this.dialogs.length-1];
	}
	removeAll() {
		for(const dialog of this.dialogs) {
			this.dialogHolder.removeChild(dialog.el);
			if (dialog.destoy) dialog.destroy();
		}
		this.dialogs = [];
		this.update();
	}
	update() {
		if (this.dialogs.length > 0) {
			this.dialogHolder.insertBefore(this.curtain, this.dialogs[this.dialogs.length-1].el);
		} else {
			this.dialogHolder.removeChild(this.curtain);
		}
	}
}

export class Dialog {
	constructor() {
		this.el = document.createElement("div");
		this.el.classList.add("dialog");
		this.dismissable = true;
	}
}

export class MainMenuDialog extends Dialog {
	constructor() {
		super();
		this.dismissable = false;
		const title = document.createElement("h1");
		title.classList.add("title");
		title.textContent = "Game Artificial Intelligence Lab";
		this.playButton = new Button("Play", () => {
			getMainInstance().dialogManager.removeAll();
			getMainInstance().restartLevel();
		});
		this.helpButton = new Button("Help", () => {
			getMainInstance().dialogManager.add(new HelpDialog());
		});
		this.settingsButton = new Button("Settings", () => {
			getMainInstance().dialogManager.add(new SettingsDialog());
		});
		this.el.append(title, this.playButton.el, this.helpButton.el, this.settingsButton.el);
	}
}

export class SettingsDialog extends Dialog {
	constructor() {
		super();
		const title = document.createElement("h1");
		title.classList.add("title");
		title.textContent = "Settings";
		this.sound = new SettingCheckbox("sound", "Sound");
		this.music = new SettingCheckbox("music", "Music");
		this.screenShake = new SettingCheckbox("screenShake", "Screen shake");
		this.viewBob = new SettingCheckbox("viewBob", "View bobbing");
		this.lockCameraY = new SettingCheckbox("lockCameraY", "Lock camera Y");
		this.debugMenu = new SettingCheckbox("debugMenu", "Debug menu");
		this.debugPaths = new SettingCheckbox("showPaths", "Show paths");
		this.debugGoals = new SettingCheckbox("showGoals", "Show goals");
		this.powerupsPerLevel = new SettingNumber("powerupsPerLevel", "Powerups per level", 0, 100, 1);
		this.el.append(title, this.sound.el, this.music.el, this.screenShake.el, this.viewBob.el, this.lockCameraY.el, this.debugMenu.el, this.debugPaths.el, this.debugGoals.el, this.powerupsPerLevel.el);
	}
}

export class HelpDialog extends Dialog {
	constructor() {
		super();
		const title = document.createElement("h1");
		title.classList.add("title");
		title.textContent = "Help";
		this.controlsButton = new Button("Controls", () => {
			getMainInstance().dialogManager.add(new HelpControlsDialog());
		});
		this.enemiesButton = new Button("Enemies", () => {
			getMainInstance().dialogManager.add(new HelpEnemiesDialog());
		});
		this.el.append(title, this.controlsButton.el, this.enemiesButton.el);
	}
}

export class HelpControlsDialog extends Dialog {
	constructor() {
		super();
		const title = document.createElement("h1");
		title.classList.add("title");
		title.textContent = "Controls";
		this.wasd = new HelpEntry("WASD/ArrowKeys - walking");
		this.espace = new HelpEntry("E/Space - droping bomb/exiting level");
		this.qenter = new HelpEntry("Q/Enter - remote");
		this.el.append(title, this.wasd.el, this.espace.el, this.qenter.el);
	}
}

export class HelpEnemiesDialog extends Dialog {
	constructor() {
		super();
		const title = document.createElement("h1");
		title.classList.add("title");
		title.textContent = "Enemies";
		this.greenEnemy = new HelpEntry("Green enemies collect powerups. The more powerups they have, the higher their aggro range becomes.", "help/green.png");
		this.redEnemy = new HelpEntry("Red enemies don't try to mine powerups intentionally. They start attacking you immediately.", "help/red.png");
		this.purpleEnemy = new HelpEntry("Purple enemies are like red enemies, but instead of trying to explode you, they kill you by touching.", "help/purple.png");
		this.cyanEnemy = new HelpEntry("Cyan enemies collect powerups as far away from you as possible.", "help/cyan.png");
		this.el.append(title, this.greenEnemy.el, this.redEnemy.el, this.purpleEnemy.el, this.cyanEnemy.el);
	}
}

export class Button {
	constructor(text, callback) {
		this.el = document.createElement("button");
		this.el.classList.add("dialogButton");
		this.el.textContent = text;
		if (callback) this.el.addEventListener("click", callback);
	}
}
export class SettingCheckbox {
	constructor(name, label) {
		this.el = document.createElement("div");
		this.el.classList.add("settingsRow");
		this.label = document.createElement("div");
		this.label.textContent = label;
		this.label.classList.add("settingsLabel");
		this.input = document.createElement("input");
		this.input.type = "checkbox";
		this.input.checked = getMainInstance().settings[name];
		this.input.classList.add("settingsCheckbox");
		this.input.addEventListener("change", (event) => {
			getMainInstance().settings[name] = event.target.checked;
			getMainInstance().saveSettings();
		});
		this.el.append(this.label, this.input);
	}
}
export class SettingNumber {
	constructor(name, label, min, max, step) {
		this.el = document.createElement("div");
		this.el.classList.add("settingsRow");
		this.label = document.createElement("div");
		this.label.textContent = label;
		this.label.classList.add("settingsLabel");
		this.input = document.createElement("input");
		this.input.type = "number";
		if (min != undefined) this.input.min = min;
		if (max != undefined) this.input.max = max;
		if (step != undefined) this.input.step = step;
		this.input.value = getMainInstance().settings[name];
		this.input.classList.add("settingsNumber");
		this.input.addEventListener("change", (event) => {
			getMainInstance().settings[name] = event.target.value;
			getMainInstance().saveSettings();
		});
		this.el.append(this.label, this.input);
	}
}

export class HelpEntry {
	constructor(text, image) {
		this.el = document.createElement("div");
		this.el.classList.add("helpRow");
		this.label = document.createElement("div");
		this.label.textContent = text;
		this.label.classList.add("helpText");
		this.img = null;
		if (image) {
			this.img = document.createElement("img");
			this.img.src = `img/${image}`;
			this.img.classList.add("helpImage");
			this.el.append(this.img);
		}
		this.el.append(this.label);
	}
}