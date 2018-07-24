import * as GB from "./../core";

module.exports = function(speed, keys) {
	
	switch (keys) {
		case ("Arrows"): keys = ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]; break;
		case ("WASD"): keys = ["KeyW", "KeyA", "KeyS", "KeyD"]; break;
	}
	
	this.eventAddAction("create", function() {
		console.log("Created...", speed, keys);
	});
	
	this.eventAddAction("step", function() {
		
		// Get direction
		let x = 0, y = 0;
		if (GB.input.keyboard.down[keys[0]]) y -= 1;
		if (GB.input.keyboard.down[keys[1]]) x -= 1;
		if (GB.input.keyboard.down[keys[2]]) y += 1;
		if (GB.input.keyboard.down[keys[3]]) x += 1;
		
		// Apply
		if (x !== 0 || y !== 0) {
			const dir = GB.math.pointDirection(0, 0, x, y);
			[x, y] = GB.math.lengthDir(speed, dir);
			this.x += x;
			this.y += y;
		}
		
	});
	
}