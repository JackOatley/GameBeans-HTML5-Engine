import keyValues from "../keyvalues.js";

export const press = {};
export const down = {};
export const release = {};

/**
 *
 */
export function init() {

	keyValues.forEach((key) => {
		press[key] = false;
		down[key] = false;
		release[key] = false;
	});

	document.addEventListener("keydown", e => {
		e.preventDefault();
		if (!down[e.code]) {
			press[e.code] = true;
			down[e.code] = true;
		}
	});

	document.addEventListener("keyup", e => {
		e.preventDefault();
		release[e.code] = true;
		down[e.code] = false;
	});

}

/**
 *
 */
export const update = () => {
	Object.keys(down).forEach((key) => {
		press[key] = false;
		release[key] = false;
	});
}

/**
 *
 */
export const clear = () => {
	Object.keys(down).forEach((key) => {
		down[key] = false;
		press[key] = false;
		release[key] = false;
	});
}
