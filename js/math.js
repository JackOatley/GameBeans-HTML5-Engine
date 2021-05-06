
// constances
export const PI = Math.PI;
export const RADTODEG = 180 / PI;
export const DEGTORAD = PI / 180;

// copied functions
export const cos = Math.cos;
export const sin = Math.sin;
export const sign = Math.sign;

/**
 *
 */
export const randomInt = function(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 */
export const choose = function( ...value) {
	return value[Math.floor(Math.random() * value.length)];
}

/** */
export const lengthDir = (l, d) => {
	d *= DEGTORAD;
	return [Math.cos(d) * l, Math.sin(d) * l];
}

/** */
export const lengthDirX = (l, d) => Math.cos(d * DEGTORAD) * l;

/** */
export const lengthDirY = (l, d) => Math.sin(d * DEGTORAD) * l;

/**
 * @param {!number} x1
 * @param {!number} y1
 * @param {!number} x2
 * @param {!number} y2
 */
export const pointDistance = function(x1, y1, x2, y2) {
	const a = x1 - x2;
	const b = y1 - y2;
	return Math.sqrt(a*a + b*b);
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
export const pointDirection = function(x1, y1, x2, y2) {
	return ((Math.atan2(y2 - y1, x2 - x1) * RADTODEG) + 360) % 360;
}

/**
 *
 */
export const angleDifference = function(angle1, angle2) {
	let diff = (angle2 - angle1) % 360;
	if (diff <= -180) return diff + 360;
	return diff - 360;
}
