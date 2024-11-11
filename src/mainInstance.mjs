import { Main } from "./Main.mjs";

let main = null;

export function init() {
	main = new Main();
	main.init();
	window.main = main;
}

export function getMainInstance() {
	if (!main) {
		throw new Error("Main instance not initialized");
	}
	return main;
}

init();