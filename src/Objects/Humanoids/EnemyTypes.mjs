import { Enemy } from "./Enemy.mjs";

export class AggressiveEnemy extends Enemy {
	constructor(main) {
		super(main);
		this.sprite.setFilter("url(#red)");
	}
	decideWhatToDoNext() {
		this.setSecondaryTask("escape") ||
		this.setSecondaryTask("pickup powerups") ||
		this.setSecondaryTask("attack") ||
		this.setSecondaryTask("remote") ||
		this.setSecondaryTask("wait");
	}
}
export class AggressiveMeleeEnemy extends Enemy {
	constructor(main) {
		super(main);
		this.sprite.setFilter("url(#purple)");
	}
	decideWhatToDoNext() {
		this.setSecondaryTask("escape") ||
		this.setSecondaryTask("pickup powerups") ||
		this.setSecondaryTask("attack melee") ||
		this.setSecondaryTask("remote") ||
		this.setSecondaryTask("wait");
	}
}
export class LevelupEnemy extends Enemy {
	constructor(main) {
		super(main);
		this.sprite.setFilter("url(#green)");
	}
	decideWhatToDoNext() {
		const distance = this.distanceToPlayer();
		const readyToAttack = this.powerups * 2 > distance;
		this.setSecondaryTask("escape") ||
		this.setSecondaryTask("pickup powerups") ||
		(readyToAttack && this.setSecondaryTask("attack")) ||
		this.setSecondaryTask("mine powerups") ||
		this.setSecondaryTask("remote") ||
		this.setSecondaryTask("wait");
	}
}
export class ScaredEnemy extends Enemy {
	constructor(main) {
		super(main);
		this.sprite.setFilter("url(#cyan)");
	}
	decideWhatToDoNext() {
		this.setSecondaryTask("escape") ||
		this.setSecondaryTask("pickup powerups") ||
		this.setSecondaryTask("mine powerups far") ||
		this.setSecondaryTask("remote") ||
		this.setSecondaryTask("wait");
	}
}