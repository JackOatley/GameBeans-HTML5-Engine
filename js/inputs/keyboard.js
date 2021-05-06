
// Keyboard object
const keyboard = {
	press: {},
	down: {},
	release: {}
}

/**
 *
 */
export function init() {

	keyValues.forEach((key) => {
		keyboard.press[key] = false;
		keyboard.down[key] = false;
		keyboard.release[key] = false;
	});

	document.addEventListener("keydown", e => {
		e.preventDefault();
		if (!keyboard.down[e.code]) {
			keyboard.press[e.code] = true;
			keyboard.down[e.code] = true;
		}
	});

	document.addEventListener("keyup", e => {
		e.preventDefault();
		keyboard.release[e.code] = true;
		keyboard.down[e.code] = false;
	});

}

/**
 *
 */
export function update() {
	Object.keys(keyboard.down).forEach((key) => {
		keyboard.press[key] = false;
		keyboard.release[key] = false;
	});
}

/**
 *
 */
export function clear() {
	Object.keys(keyboard.down).forEach((key) => {
		keyboard.down[key] = false;
		keyboard.press[key] = false;
		keyboard.release[key] = false;
	});
}
