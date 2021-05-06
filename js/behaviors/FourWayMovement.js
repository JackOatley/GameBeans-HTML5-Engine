import * as GB from "./../core.js";

export function FourWayMovement(speed, keys) {

	switch (keys) {
		case ("Arrows"): keys = ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]; break;
		case ("WASD"): keys = ["KeyW", "KeyA", "KeyS", "KeyD"]; break;
	}

	//this.eventAddAction("create", function() {
		//console.log("Created...", speed, keys);
	//});

	this.eventAddAction("step", function() {

		// Get direction
		let dir = 0;
		if (GB.input.keyboard.down[keys[0]]) dir = 1;
		if (GB.input.keyboard.down[keys[1]]) dir = 2;
		if (GB.input.keyboard.down[keys[2]]) dir = 3;
		if (GB.input.keyboard.down[keys[3]]) dir = 4;

		// Apply
		switch (dir) {
			case (1): this.y -= speed; break;
			case (2): this.x -= speed; break;
			case (3): this.y += speed; break;
			case (4): this.x += speed; break;
		}

	});

}
