import draw from "./draw";
import Generator from "./generator";

/**
 *
 */
class Canvas {

	/**
	 * @param {Object} [opts={}]
	 * @param {bumber} [opts.width=300]
	 * @param {bumber} [opts.height=150]
	 * @param {bumber} [opts.scale=1]
	 * @param {boolean} [opts.application=false]
	 * @param {boolean} [opts.crisp2D=false]
	 * @param {string} [opts.context="2d"]
	 */
	constructor(opts = {}) {
		var defaultContext = opts.context || "2d";
		var c = document.createElement("CANVAS");
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
		if (c.application) {
			draw.setTarget(this);
			Canvas.setMain(this);
		}

		//
		c.oncontextmenu = function(e) {
			e.preventDefault();
		}

		//
		Canvas.array.push(this);
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

	/**
	 * Sets the canvas as the main canvas for the game.
	 * @return {void}
	 */
	setMain() {
		var c = this.domElement;
		Canvas.main = this;
		if (Canvas.dom === null) {
			Canvas.dom = c;
			var el = document.getElementById("gbgamebox") || document.body;
			el.appendChild(c);
		}

	}

	/**
	 *
	 */
	unsetMain() {
		this.domElement.remove();
		Canvas.main = null;
		Canvas.dom = null;
	}

	/**
	 * @param {string} [color="#000"] CSS value as a string.
	 * @return {void}
	 */
	fill(color) {
		var c = this.domElement;
		var ctx = this.context;
		if (ctx instanceof CanvasRenderingContext2D) {
			ctx.fillStyle = color || "#000";
			ctx.fillRect(0, 0, c.width / c.scale, c.height / c.scale);
		}
	}

	/**
	 * Clears the canvas.
	 * @return {void}
	 */
	clear() {
		var c = this.domElement;
		var ctx = this.context;
		if (ctx instanceof CanvasRenderingContext2D) {
			ctx.clearRect(0, 0, c.width / c.scale, c.height / c.scale);
		}
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

	/**
	 * Gets the Canvas that is currently set as the main game canvas.
	 * @return {Object}
	 */
	static getMain() {
		return Canvas.main;
	}

}

Generator.classStaticMatch(Canvas);
Canvas.array = [];
Canvas.main = null;
Canvas.dom = null;

export default Canvas;
