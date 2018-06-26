import draw from "./draw";
import Generator from "./generator";

/**
 *
 */
class Canvas {

	/**
	 * @param {Object} [opts={}]
	 * @param {Number} [opts.width=300]
	 * @param {Number} [opts.height=150]
	 * @param {Number} [opts.scale=1]
	 * @param {Boolean} [opts.application=false]
	 * @param {Boolean} [opts.script2D=false]
	 */
	constructor(opts = {}) {
		const c = document.createElement("CANVAS");
		const ctx = c.getContext("2d");
		this.domElement = c;
		this.context = ctx;
		this.width = opts.width || 300;
		this.height = opts.height || 150;
		
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
		c.oncontextmenu = (e) => e.preventDefault();
		
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
	 */
	setMain() {
		let c = this.domElement;
		Canvas.main = this;
		if (Canvas.dom === null) {
			Canvas.dom = c;
			var el = document.getElementById("gbgamebox") || document.body;
			el.appendChild(c);
		}
	
	}
	
	/**
	 * Gets the canvas that is currently set as the main game canvas.
	 */
	static getMain() {
		return Canvas.main;
	}
	
	/**
	 * @param {String} color="#000000" CSS value as a string.
	 */
	fill(color) {
		let c = this.domElement;
		var ctx = this.context;
		ctx.fillStyle = color || "#000000";
		ctx.fillRect(0, 0, c.width / c.scale, c.height / c.scale);
	}

	/**
	 * Clears the canvas.
	 */
	clear() {
		var c = this.domElement;
		var ctx = this.context;
		ctx.clearRect(0, 0, c.width / c.scale, c.height / c.scale);
	}
	
	/**
	 * Returns the RGBA components of a pixel on the canvas as an ArrayBuffer.
	 * @param {Number} x X position of the pixel, must be an integer.
	 * @param {Number} y Y position of the pixel, must be an integer.
	 * @returns {ArrayBuffer} An ArrayBuffer with 4 values (for R, G, B, A).
	 */
	getPixel(x, y) {
		const data = this.context.getImageData(x, y, 1, 1).data;
		return data;
	}

}

Generator.classStaticMatch(Canvas);
Canvas.array = [];
Canvas.main = null;
Canvas.dom = null;

export default Canvas;