import {ARROW_KEYS, WASD_KEYS, input} from "../core.js";
import {checkGridAlign} from "../instance.js";

export function GridMovement(speed, keys, w, h)
{

	switch (keys) {
		case ("Arrows"): keys = ARROW_KEYS; break;
		case ("WASD"): keys = WASD_KEYS; break;
	}

	this.eventAddAction("step", function() {

		if (checkGridAlign.call(this, w, h)) {
			this.speed = 0;
			let x = 0;
			let y = 0;
			if (input.keyboard.down[keys[0]]) y = -1;
			if (input.keyboard.down[keys[1]]) x = -1;
			if (input.keyboard.down[keys[2]]) y = 1;
			if (input.keyboard.down[keys[3]]) x = 1;
			this.speedX = x * speed;
			this.speedY = y * speed;
		} else {

		}

	});
}
