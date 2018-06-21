import draw from "./draw.js";
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
		
		//
		c.width = opts.width || 300;
		c.height = opts.height || 150;
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

/*
//
let canvas = {
	
	//
	array: [],
	main: null,
	dom: null,


	create: function(opts = {}) {
		
		//
		let c = document.createElement("CANVAS");
		let ctx = c.getContext("2d");
		canvas.array.push( c );
		
		//
		c.width = opts.width || 300;
		c.height = opts.height || 150;
		c.scale = opts.scale || 1;
		c.application = opts.application || false;
		
		//
		if (opts.crisp2D) {
			ctx.imageSmoothingEnabled = false;
		}
		
		//
		if ( c.application ) {
			draw.setTarget( c );
			canvas.setMain( c );
		}
		
		//
		c.oncontextmenu = function( e ){
			e.preventDefault()
		}
		
		//
		return c;
	},


	setMain: function(c) {
	
		canvas.main = c;
		if ( canvas.dom === null ) {
			canvas.dom = c;
			var el = document.getElementById("gbgamebox") || document.body;
			el.appendChild( c );
		}
	
	},
	

	getMain: function() {
		return canvas.main;
	},
	

	fill: function(c, color) {
		var ctx = c.getContext( "2d" );
		ctx.fillStyle = color || "#000000";
		ctx.fillRect( 0, 0, c.width / c.scale, c.height / c.scale );
	},


	clear: function(c) {
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width / c.scale, c.height / c.scale);
	}
	
}

//
export default canvas;*/
