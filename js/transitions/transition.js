import * as draw from ".././draw.js";

import {fade} from "./types/fade.js";
import {swipeLeft} from "./types/swipeLeft.js";

const allInstances = [];
const prefabs = {
	"fade": fade,
	"swipeLeft": swipeLeft
}

export class Transition {

	constructor({
		type = "fade",
		time = 60,
		color = "black",
		callback = undefined
	}) {
		this.x = 0;
		this.y = 0;
		this.type = type;
		this.time = time;
		this.color = color;
		this.callback = callback;
		this.direction = 1;
		this.alpha = 0;
		this.delta = 1 / this.time;
		allInstances.push(this);

		// Check transition type exists and log warning otherwise
		if (!(this.type in prefabs)) {
			window.addConsoleText("#F00", "Unknown transition type: " + this.type);
			this.type = "fade";
		}

		prefabs[this.type]?.start?.(this, draw.context);
	}

	update() {
		prefabs[this.type]?.update(this, draw.context);
	}

	draw() {
		prefabs[this.type]?.draw(this, draw.context);
	}

	destroy() {
		let x = allInstances.indexOf(this);
		allInstances.splice(x, 1);
		console.log(allInstances);
	}

	static create(opts) {
		return new Transition(opts);
	}

	static updateAll() {
		for (const t of allInstances)
			t.update();
	}

	static drawAll() {
		for (const t of allInstances)
			t.draw();
	}

}
