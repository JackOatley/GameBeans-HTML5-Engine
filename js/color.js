
let color = {

	/**
	 * @param {string} hex A hex string.
	 */
	hexToRgb: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},
	
	/**
	 * @param {number} c The component.
	 */
	componentToHex: function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	},

	/**
	 * @param {number} r The red component.
	 * @param {number} g The green component.
	 * @param {number} b The blue component.
	 */
	rgbToHex: function(r, g, b) {
		return "#" + color.componentToHex(r)
				   + color.componentToHex(g)
				   + color.componentToHex(b);
	}
	
}

//
export default color;