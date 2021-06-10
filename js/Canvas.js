
//
export let array = [];
export let main = null;
export let dom = null;

/**
 *
 */
export default class Canvas {

	/**
	 * @param {Object} [opts={}]
	 * @param {bumber} [opts.width=300]
	 * @param {bumber} [opts.height=150]
	 * @param {bumber} [opts.scale=1]
	 * @param {boolean} [opts.crisp2D=false]
	 * @param {string} [opts.context="2d"]
	 */
	constructor(opts = {}) {
		var defaultContext = opts.context || "2d";
		var c = document.createElement("canvas");
		var ctx = c.getContext(defaultContext);
		this.domElement = c;
		this.context = ctx;
		this.width = this._width = opts.width || 300;
		this.height = this._height = opts.height || 150;

		//
		c.scale = opts.scale || 1;
		c.application = opts.application || false;

		//
		if (opts.crisp2D) {
			ctx.imageSmoothingEnabled = false;
		}

		//
		c.oncontextmenu = function(e) {
			e.preventDefault();
		}

		//
		array.push(this);
	}

	get width() {
		return this._width;
	}

	set width(x) {
		this._width = x;
		this.domElement.width = x;
	}

	get height() {
		return this._height;
	}

	set height(x) {
		this._height = x;
		this.domElement.height = x;
	}

	setMain() {
		setMain(this);
	}

	unsetMain() {
		this.domElement.remove();
		main = null;
		dom = null;
	}

	fill(color) {
		fill(this, color);
	}

	clear() {
		clear(this);
	}

	/**
	 * Set the RGBA components of a pixel on the canvas as an ArrayBuffer.
	 * @param {number} x X position of the pixel, must be an integer.
	 * @param {number} y Y position of the pixel, must be an integer.
	 * @returns {void}
	 */
	setPixel(x, y, data) {
		var imageData = this.context.getImageData(x, y, 1, 1);
		imageData.data.set(data);
		this.context.putImageData(imageData, x, y);
	}

	/**
	 * Returns the RGBA components of a pixel on the canvas as an ArrayBuffer.
	 * @param {number} x X position of the pixel, must be an integer.
	 * @param {number} y Y position of the pixel, must be an integer.
	 * @returns {ArrayBuffer} An ArrayBuffer with 4 values (for R, G, B, A).
	 */
	getPixel(x, y) {
		return this.context.getImageData(x, y, 1, 1).data;
	}

	/**
	 * @param {ImageData} data
	 * @return {void}
	 */
	setImageData(data) {
		this.context.putImageData(data, 0, 0);
	}

	/**
	 * Returns the entire pixel buffer of the canvas.
	 * @return {ArrayBuffer}
	 */
	getImageData() {
		return this.context.getImageData(0, 0, this.width, this.height).data;
	}
}

Canvas.clear = clear;
Canvas.fill = fill;
Canvas.setMain = setMain;
Canvas.getMain = getMain;

export function clear({domElement: c, context: ctx})
{
	ctx.clearRect(0, 0, c.width / c.scale, c.height / c.scale);
}

// Fills the canvas with the given CCS color string.
export function fill({domElement: c, context: ctx}, color = "black", alpha = 1)
{
	if (alpha <= 0) return;
	ctx.fillStyle = color;
	ctx.globalAlpha = alpha;
	ctx.fillRect(0, 0, c.width / c.scale, c.height / c.scale);
	ctx.globalAlpha = 1;
}

//
export function setMain(target)
{
	var c = target.domElement;
	main = target;
	if (dom === null) {
		dom = c;
		document.body.appendChild(c);
	}
}

// Gets the Canvas that is currently set as the main game canvas.
export function getMain()
{
	return main;
}
