import draw from "./draw";
import Generator from "./generator";

/**
 *
 */
export default class Canvas {

	/**
	 *
	 */
	constructor(opts = {}) {
		const c = document.createElement("CANVAS");
		const ctx = c.getContext("2d");
		this.domElement = c;
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
	 *
	 */
	setMain() {
		let c = this.domElement;
		Canvas.main = this;
		if (Canvas.dom === null) {
			Canvas.dom = c;
			var el = document.getElementById("gbgamebox") || document.body;
			console.log(this, c);
			el.appendChild(c);
		}
	
	}
	
	/**
	 *
	 */
	static getMain() {
		return Canvas.main;
	}
	
	/**
	 *
	 */
	fill(color) {
		let c = this.domElement;
		var ctx = c.getContext( "2d" );
		ctx.fillStyle = color || "#000000";
		ctx.fillRect( 0, 0, c.width / c.scale, c.height / c.scale );
	}

	/**
	 *
	 */
	clear() {
		var c = this.domElement;
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width / c.scale, c.height / c.scale);
	}

}

Generator.classStaticMatch(Canvas);
Canvas.array = [];
Canvas.main = null;
Canvas.dom = null;