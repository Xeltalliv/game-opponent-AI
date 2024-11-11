export class InputManager {
	constructor(main) {
		this.actions = new Map();
		this.keysToActions = new Map();
		this.boundOnKeyDown = this.onKeyDown.bind(this);
		this.boundOnKeyUp = this.onKeyUp.bind(this);
		window.addEventListener("keydown", this.boundOnKeyDown);
		window.addEventListener("keyup", this.boundOnKeyUp);
	}
	destroy() {
		window.removeEventListener("keydown", this.boundOnKeyDown);
		window.removeEventListener("keyup", this.boundOnKeyUp);
	}
	onKeyDown(event) {
		if (this.onKeyChange(event.code, true)) event.preventDefault();
	}
	onKeyUp(event) {
		if (this.onKeyChange(event.code, false)) event.preventDefault();
	}
	onKeyChange(keyCode, newState) {
		const actionsSet = this.keysToActions.get(keyCode);
		if (!actionsSet) return false;
		for(const action of actionsSet) {
			action.updateKey(keyCode, newState)
		}
		return true;
	}
	defineAction(name, keys) {
		const action = new Action(name, keys);
		this.actions.set(name, action);
		for(const key of keys) {
			let actionsSet = this.keysToActions.get(key);
			if (!actionsSet) {
				actionsSet = new Set();
				this.keysToActions.set(key, actionsSet);
			}
			actionsSet.add(action);
		}
	}
	getAction(name) {
		return this.actions.get(name);
	}
}

class Action {
	constructor(name, keys) {
		this.name = name;
		this.active = false;
		this.keysActiveCount = 0;
		this.keysActive = Object.fromEntries(keys.map(key => [key, false]));
		this.onActionDownCbs = new Set();
		this.onActionUpCbs = new Set();
	}
	onActionDown(callback) {
		this.onActionDownCbs.add(callback);
	}
	onActionUp(callback) {
		this.onActionUpCbs.add(callback);
	}
	removeOnActionDown(callback) {
		this.onActionDownCbs.delete(callback);
	}
	removeOnActionUp(callback) {
		this.onActionUpCbs.delete(callback);
	}
	fireActionDown() {
		for(const cb of this.onActionDownCbs) {
			cb();
		}
	}
	fireActionUp() {
		for(const cb of this.onActionUpCbs) {
			cb();
		}
	}
	updateKey(keyCode, newState) {
		const oldState = this.keysActive[keyCode];
		if (oldState !== newState) {
			this.keysActive[keyCode] = newState;
			this.keysActiveCount += newState ? 1 : -1;
			const oldActive = this.keysActiveCount
			const newActive = this.keysActiveCount > 0;
			this.active = newActive;
			if (oldActive !== newActive) {
				if (newActive) {
					this.fireActionDown();
				} else {
					this.fireActionUp();
				}
			}
		}
	}
}