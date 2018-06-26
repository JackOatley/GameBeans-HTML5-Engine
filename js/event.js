import keyValues from "./keyvalues.js";

//
let events = {
	create: "create",
	roomEnter: "roomEnter",
	roomLeave: "roomLeave",
	step: "step",
	draw: "draw",
	collision: "collision_",
	resize: "resize",
	keyboard: {
		...translate( keyValues ),
		pressed: translate( keyValues, "Pressed" ),
		released: translate( keyValues, "Released" )
	}
}
	
/**
 * @param {array} array
 * @param {string} [postfix=""]
 */
function translate(array, postfix = "") {
	let obj = {};
	array.forEach((name) => {
		obj[name] = name + postfix;
	});
	return obj;
}

//
export default events;