import draw from "./draw.js";
	
//
let canvas = {
	
	//
	array: [],
	main: null,
	dom: null,

	/**
	 *
	 */
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

	/**
	 *
	 */
	setMain: function(c) {
	
		canvas.main = c;
		if ( canvas.dom === null ) {
			canvas.dom = c;
			var el = document.getElementById("gbgamebox") || document.body;
			el.appendChild( c );
		}
	
	},
	
	/**
	 *
	 */
	getMain: function() {
		return canvas.main;
	},

	/**
	 *
	 */
	clear: function(c, color) {
		var ctx = c.getContext( "2d" );
		ctx.fillStyle = color || "#000000";
		ctx.fillRect( 0, 0, c.width / c.scale, c.height / c.scale );
	}
	
}

//
export default canvas;
