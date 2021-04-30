/**
 * @module math
 */

let math = {

	// constances
	PI: Math.PI,
	RADTODEG: 180 / Math.PI,
	DEGTORAD: Math.PI / 180,

	// copied functions
	cos: Math.cos,
	sin: Math.sin,
	sign: Math.sign,

	/**
	 *
	 */
	randomInt: function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	 *
	 */
	choose: function( ...value) {
		return value[Math.floor( Math.random() * value.length )];
	},

	/** */
	lengthDir: (l, d) => {
		d *= math.DEGTORAD;
		return [Math.cos(d) * l, Math.sin(d) * l];
	},

	/** */
	lengthDirX: function(l, d) {
		return Math.cos(d * math.DEGTORAD) * l;
	},

	/** */
	lengthDirY: function(l, d) {
		return Math.sin(d * math.DEGTORAD) * l;
	},

	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 */
	pointDistance: function(x1, y1, x2, y2) {
		const a = x1 - x2;
		const b = y1 - y2;
		return Math.sqrt(a*a + b*b);
	},

	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 */
	pointDirection: function(x1, y1, x2, y2) {
		return ((Math.atan2(y2 - y1, x2 - x1) * math.RADTODEG) + 360) % 360;
	},

	/**
	 *
	 */
	angleDifference: function(angle1, angle2) {

		let diff = (angle2 - angle1) % 360;

		if (diff <= -180) {
			diff += 360;
		} else if (diff > 180) {
			diff -= 360;
		}

		return diff;

	}

}

//
export default math;
