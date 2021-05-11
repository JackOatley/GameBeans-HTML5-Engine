import { ARROW_KEYS, WASD_KEYS, input, math } from "./../core.js";

export function EightWayMovement(speed, keys) {

	switch (keys) {
		case ("Arrows"): keys = ARROW_KEYS; break;
		case ("WASD"): keys = WASD_KEYS; break;
	}

	this.eventAddAction("step", function() {

		// Get direction
		let x = 0, y = 0;
		if (input.keyboard.down[keys[0]]) y -= 1;
		if (input.keyboard.down[keys[1]]) x -= 1;
		if (input.keyboard.down[keys[2]]) y += 1;
		if (input.keyboard.down[keys[3]]) x += 1;

		// Apply
		if (x !== 0 || y !== 0) {
			const dir = math.pointDirection(0, 0, x, y);
			[x, y] = math.lengthDir(speed, dir);
			this.x += x;
			this.y += y;
		}

	});

}
