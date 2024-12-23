import { SoundsSrc } from "./SoundsSrc.mjs";
import { getMainInstance } from "../mainInstance.mjs";

export class SfxManager {
	constructor(main) {
		this.audioContext = new AudioContext();
		this.sounds = {};
		this.goOver(SoundsSrc, this.sounds);
	}
	play(audioBuffer) {
		if (!audioBuffer) return null;
		const sfx = new Sfx(this.audioContext, audioBuffer);
		sfx.start();
		return sfx;
	}
	goOver(srcObject, dstObject) {
		for(const key in srcObject) {
			const value = srcObject[key];
			const type = typeof value;
			if (type === "object") {
				dstObject[key] = Array.isArray(value) ? [] : {};
				this.goOver(srcObject[key], dstObject[key]);
			}
			if (type === "string") {
				dstObject[key] = this.load(value);
			}
		}
	}
	async load(value) {
		const response = await fetch(`./sfx/${value}`);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
		return audioBuffer;
	}
}

class Sfx {
	constructor(audioContext, audioBufferPromise) {
		this.audioContext = audioContext;
		this.source = audioContext.createBufferSource();
		this.source.connect(audioContext.destination);
		this.ready = this.init(audioBufferPromise);
		this.started = false;
	}
	async init(audioBufferPromise) {
		this.source.buffer = await audioBufferPromise;
		return true;
	}
	async start() {
		if (!getMainInstance().settings.sound) return;
		await this.ready;
		this.source.start();
		this.started = true;
	}
	stop() {
		if (!this.started) return;
		this.source.stop();
		this.started = false;
	}
	loop() {
		this.source.loop = true;
	}
	destroy() {
		this.source.disconnect();
		this.audioContext = null;
		this.source = null;
	}
}