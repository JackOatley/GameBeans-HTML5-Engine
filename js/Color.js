
/**
 * @param {string} hex A hex string.
 * @return {Object}
 */
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
		a: 255
	} : {
		r: 0,
		g: 0,
		b: 0,
		a: 255
	};
}

/**
 * @param {string} hex A hex string.
 * @return {Array}
 */
function hexToArray(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16),
		255
	] : [0, 0, 0, 255];
}

/**
 * @param {number} c The component.
 * @return {string}
 */
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

/**
 * @param {number} r The red component.
 * @param {number} g The green component.
 * @param {number} b The blue component.
 * @return {string}
 */
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//
export default {
	hexToRgb,
	componentToHex,
	rgbToHex,
	hexToArray
}
