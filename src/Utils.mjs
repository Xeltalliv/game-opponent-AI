export function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

export function popRandomFromArray(array) {
	const index = Math.floor(Math.random() * array.length);
	return array.splice(index, 1)[0];
}

export function remapFromTo(x, inMin, inMax, outMin, outMax, clampRange) {
	let t = (x - inMin) / (inMax - inMin);
	if (clampRange) {
		if (t > 1) t = 1;
		if (t < 0) t = 0;
	}
	return outMin + t * (outMax - outMin);
}