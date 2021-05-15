import keyValues from "./keyvalues.js";

//
const events = {
	create: "create",
	roomEnter: "roomEnter",
	roomLeave: "roomLeave",
	step: "step",
	draw: "draw",
	collision: "collision_",
	outsideRoom: "outsideRoom",
	resize: "resize",
	keyboard: {
		...translate(keyValues),
		pressed: translate(keyValues, "Press"),
		released: translate(keyValues, "Release")
	}
}

/**
 * @param {array} array
 * @param {string} [postfix=""]
 */
function translate(array, postfix = "") {
	const obj = {};
	array.forEach((name) => obj[name] = name + postfix);
	return obj;
}

//
export default events;
