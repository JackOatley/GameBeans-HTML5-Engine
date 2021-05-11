import { ARROW_KEYS, WASD_KEYS, input } from "./../core.js";

export function FourWayMovement(speed, keys) {

	switch (keys) {
		case ("Arrows"): keys = ARROW_KEYS; break;
		case ("WASD"): keys = WASD_KEYS; break;
	}

	this.eventAddAction("step", function() {

		// Get direction
		let dir = 0;
		if (input.keyboard.down[keys[0]]) dir = 1;
		if (input.keyboard.down[keys[1]]) dir = 2;
		if (input.keyboard.down[keys[2]]) dir = 3;
		if (input.keyboard.down[keys[3]]) dir = 4;

		// Apply
		switch (dir) {
			case (1): this.y -= speed; break;
			case (2): this.x -= speed; break;
			case (3): this.y += speed; break;
			case (4): this.x += speed; break;
		}

	});

}
