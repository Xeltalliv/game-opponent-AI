const Images = {
	tiles: [
		"tile0.png",
		"tile1.png",
		"tile2.png",
		"tile3.png",
		"tile0.png",
		"tile5.png",
		"tile6.png",
		"tile7.png",
		"tile8.png",
		"tile9.png",
		"tile10.png",
		"tile11.png",
		"tile12.png",
		"tile13.png",
	],
	tileEdge: "tileEdge.png",
	tileShadows: [
		"tileShadow000.png",
		"tileShadow100.png",
		"tileShadow010.png",
		"tileShadow110.png",
		"tileShadow001.png",
		"tileShadow1X1.png",
		"tileShadow011.png",
		"tileShadow1X1.png",
	],
	player: "player0.png",
	playerDying: [
		"player0.png",
		"player1.png",
		"player2.png",
		"player3.png",
		"player4.png",
	],
	bomb: [
		"bomb0.png",
		"bomb1.png",
		"bomb2.png",
		"bomb3.png",
		"bomb4.png",
		"bomb5.png",
	],
	sparks: [
		"spark0.png",
		"spark1.png",
		"spark2.png", 
	],
	shield: [
		"shield0.png",
		"shield1.png",
		"shield2.png",
	],
	remote: "remote.png",
	breaking: [
		"breaking0.png",
		"breaking1.png",
		"breaking2.png", 
	],
	powerup: {
		bomb:  "powerupBomb.png",
		range: "powerupRange.png",
		speed: "powerupSpeed.png",
		life:  "powerupLife.png",
	},
	marker: {
		attack: "markerAttack.png",
		escape: "markerEscape.png",
		mine: "markerMine.png",
		powerup: "markerPowerup.png",
	}
}
function goOver(object) {
	for(const key in object) {
		const value = object[key]
		const type = typeof value;
		if (type === "object") goOver(value);
		if (type === "string") {
			const img = new Image();
			img.src = `./img/${value}`;
			object[key] = img;
		}
	}
}
goOver(Images);
console.log(Images);

export { Images };