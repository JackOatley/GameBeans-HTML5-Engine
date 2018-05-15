/**
 * @module canvas
 */

//
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
	create: function( options = {} ) {
		
		//
		let c = document.createElement( "CANVAS" );
		canvas.array.push( c );
		
		//
		c.width = options.width || 300;
		c.height = options.height || 150;
		c.scale = options.scale || 1;
		c.application = options.application || false;
		
		//
		if ( options.crisp2D ) {
			let ctx = c.getContext( "2d" );
			ctx.imageSmoothingEnabled = false;
			//ctx.scale( c.scale, c.scale );
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
	setMain: function( c ) {
	
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
	clear: function( c, color ) {
		var ctx = c.getContext( "2d" );
		ctx.fillStyle = color || "#000000";
		ctx.fillRect( 0, 0, c.width / c.scale, c.height / c.scale );
	}
	
}

//
export default canvas;
