/**
 * @module draw
 */

import math from "./math.js";
import sprite from "./sprite.js";

//
let draw = {
	
	//
	color: "#FFFFFF",
	font: "Arial",
	fontSize: 30,
	textAlign: "start",
	textBaseline: "alphabetic",
	target: null,
	context: null,
	defaultTransform: [1, 0, 0, 1, 0, 0],
	targetStack: [],
	imageSmoothing: false,
	offsetX: 0,
	offsetY: 0,
	
	/**
	 *
	 */
	setTarget: function( target ) {
		draw.targetStack.push( draw.target );
		draw.target = target;
		draw.context = target.getContext( "2d" );
	},
	
	/**
	 *
	 */
	resetTarget: function() {
		let target = draw.targetStack.pop();
		draw.target = target;
		draw.context = target.getContext( "2d" );
	},
	
	/**
	 *
	 */
	getTarget: function() {
		return draw.target;
	},

	/**
	 *
	 */
	save: function() {
		draw.context.save();
	},
	 
	/**
	 *
	 */
	restore: function() {
		draw.context.restore();
	},
	
	/**
	 *
	 */
	reset: function() {
		draw.context.imageSmoothingEnabled = draw.imageSmoothing;
		draw.context.setTransform( ...draw.defaultTransform );
	},
	
	/**
	 *
	 */
	setImageSmoothing: function( enable ) {
		draw.imageSmoothing = enable;
	},

	//
	transform: {
		
		scale: function( x, y ) {
			draw.context.scale( x, y );
		},
		
		rotate: function( rot ) {
			draw.context.rotate( rot * math.DEGTORAD );
		},
		
		translate: function( x, y ) {
			draw.offsetX = x;
			draw.offsetY = y;
			draw.context.translate( x, y );
		},
		
		/**
		 * @param {object} opt
		 */
		setDefault: function( opt = {} ) {
			
			let trans = draw.defaultTransform;
			if ( opt.scaleX ) trans[0] = opt.scaleX;
			if ( opt.skewX ) trans[1] = opt.skewX;
			if ( opt.skewY ) trans[2] = opt.skewY;
			if ( opt.scaleY ) trans[3] = opt.scaleY;
			if ( opt.moveX ) trans[4] = opt.moveX;
			if ( opt.moveY ) trans[5] = opt.moveY;
		
		}
		
	},

	/**
	 * @param {color} c Can be a number, a hex-value or an object containing R, G, B and optionally A properties or H, S, L and optionally A properties.
	 */
	setColor: function( c ) {
		
		// quick exit if c is already a CSS color value
		if ( typeof c === "string" ) {
			draw.color = c;
		}
		
		// c is an object
		else {
			
			// RGB / RGBA
			if ( "r" in c && "g" in c && "b" in c ) {
				draw.color = ( "a" in c )
					? "rgba("+c.r+","+c.g+","+c.b+","+c.a+")"
					: "rgb("+c.r+","+c.g+","+c.b+")";
			}
			
			// HSL / HSLA
			else if ( "h" in c && "s" in c && "l" in c ) {
				draw.color = ( "a" in c )
					? "hsla("+c.h+","+c.s+"%,"+c.l+"%,"+c.a+")"
					: "hsl("+c.h+","+c.s+"%,"+c.l+"%)";
			}
		}
		
	},

	/**
	 * Draws the sprite at the given x, y position.
	 * @param {sprite} sprite
	 * @param {number} x
	 * @param {number} y
	 */
	sprite: function( spr, index, x, y, scaleX, scaleY, rotation ) {

		spr = sprite.get( spr );
		
		//
		let ctx = draw.context;
		ctx.save();
		
		//
		ctx.translate( x, y );
		ctx.rotate( rotation * math.DEGTORAD );
		ctx.scale( scaleX, scaleY );
		
		//
		index = Math.floor( index ) % spr.images.length;
		
		//
		let frame = spr.images[index];
		let img = frame.img;
		ctx.drawImage(
			img, frame.clip.x, frame.clip.y,
			frame.clip.w, frame.clip.h,
			-spr.originX, -spr.originY,
			spr.width, spr.height
		);
		
		//
		ctx.restore();

	},

	/**
	 * Draws the sprite at the given x, y position.
	 * @param {sprite} sprite
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	spriteTiled: function( spr, index, x, y, w, h ) {

		spr = sprite.get( spr );
		
		let dx, dy, rx, ry;
		for ( rx=0, dx=x; rx<w; rx++, dx+=spr.width )
		for ( ry=0, dy=y; ry<h; ry++, dy+=spr.height )
			drawSprite( spr, index, dx, dy, 1, 1, 0 );

	},

	/**
	 * Draws a canvas at the given position.
	 * @param {CANVAS} canvas The canvas to draw.
	 * @param {Number} x The X position to draw at.
	 * @param {Number} y The Y position to draw at.
	 */
	canvas: function( canvas, x, y ) {
		
		draw.context.drawImage( canvas, x, y );
		
	},
	
	/**
	 * @param {string} font
	 * @param {number} size
	 * @param {string} align Horizontal alignment.
	 * @param {string} baseline Vertical alignment.
	 */
	setFont: function( font, size, align, baseline ) {
		
		draw.font = font;
		draw.fontSize = size;
		draw.textAlign = align;
		draw.textBaseline = baseline;
		
		let ctx = draw.context;
		ctx.font = draw.fontSize + "px " + draw.font;
		ctx.textAlign = draw.textAlign;
		ctx.textBaseline = draw.textBaseline;
		
	},

	/**
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 */
	text: function( text, x, y, opts={} ) {
		
		let drawMethod = "fillText";
		let ctx = draw.context;
		
		//
		if ( opts.stroke ) {
			ctx.strokeStyle = opts.strokeColor || draw.color;
			ctx.lineWidth = opts.width || 2;
			drawMethod = "strokeText";
		} else {
			ctx.fillStyle = draw.color;
		}
		
		//
		let lineHeight = ctx.measureText("M").width * 1.2;
		let lines = text.toString().split( "#" );
		for (var i=0; i<lines.length; i++) {
			ctx[drawMethod]( lines[i], x, y );
			y += lineHeight;
		}
		
		
		
	},
	
	/**
	 *
	 */
	primitive: {
	
		textureMap: function( texture, pts ) {
			
			let ctx = draw.context;
			let spr = sprite.get( texture );
			let frame = spr.images[0];
			let img = frame.img;
			let w = spr.width;
			let h = spr.height;
			
			var tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles
			for (var t=0; t<2; t++) {
				var pp = tris[t];
				var x0 = pts[pp[0]].x, x1 = pts[pp[1]].x, x2 = pts[pp[2]].x;
				var y0 = pts[pp[0]].y, y1 = pts[pp[1]].y, y2 = pts[pp[2]].y;
				var u0 = pts[pp[0]].u*w, u1 = pts[pp[1]].u*w, u2 = pts[pp[2]].u*w;
				var v0 = pts[pp[0]].v*h, v1 = pts[pp[1]].v*h, v2 = pts[pp[2]].v*h;

				// Set clipping area so that only pixels inside the triangle will
				// be affected by the image drawing operation
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.closePath();
				ctx.clip();

				// Compute matrix transform
				var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
				var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
				var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
				var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
							  - v0*u1*x2 - u0*x1*v2;
				var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
				var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
				var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
							  - v0*u1*y2 - u0*y1*v2;

				// Draw the transformed image
				ctx.transform(delta_a/delta, delta_d/delta,
							  delta_b/delta, delta_e/delta,
							  delta_c/delta, delta_f/delta);
				ctx.drawImage( img, 0, 0 );
				ctx.restore();
			}
		}
	
	},
	
	/**
	 *
	 */
	shape: {
		
		/**
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 * @param {object} options
		 */
		line: function( x1, y1, x2, y2, options = {} ) {
		
			let ctx = draw.context;
			ctx.strokeStyle = options.color || draw.color;
			ctx.beginPath();
			ctx.moveTo( x1, y1 );
			ctx.lineTo( x2, y2 );
			ctx.stroke();
		
		},
		
		/**
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 * @param {object} options
		 */
		ellipse: function( x, y, xr, yr, options = {} ) {
		
			//
			let ctx = draw.context;
			ctx.save();
			ctx.beginPath();
			ctx.translate( x-xr, y-yr );
			ctx.scale( xr, yr );
			ctx.arc( 1, 1, 1, 0, 2 * Math.PI, false );
			ctx.restore();
			
			//
			let style;
			if ( options.healthbar ) {
				let amount = options.healthbar.amount || 1;
				let color = options.healthbar.color || "#0F0";
				let background = options.healthbar.background || "#F00";
				style = ctx.createLinearGradient( x-xr, 0, x+xr, 0 );
				style.addColorStop( 0, color );
				style.addColorStop( amount, color );
				style.addColorStop( amount, background );
				style.addColorStop( 1, background );
			} else {
				style = options.color || draw.color;
			}
			
			//
			if ( !options.fill ) {
				ctx.fillStyle = style;
				ctx.fill();
			} else {
				ctx.strokeStyle = style
				ctx.lineWidth = options.lineWidth || 1;
				ctx.stroke();
			}
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} w
		 * @param {number} h
		 * @param {object} options
		 */
		rectangle: function( x, y, w, h, options = {} ) {
		
			//
			let ctx = draw.context;
			ctx.beginPath();
			ctx.rect( x, y, w, h );
			
			//
			let style;
			if ( options.healthbar ) {
				let amount = options.healthbar.amount || 1;
				let color = options.healthbar.color || "#0F0";
				let background = options.healthbar.background || "#F00";
				style = ctx.createLinearGradient( x, 0, x+w, 0 );
				style.addColorStop( 0, color );
				style.addColorStop( amount, color );
				style.addColorStop( amount, background );
				style.addColorStop( 1, background );
			} else {
				style = options.color || draw.color;
			}
			
			//
			if ( !options.fill ) {
				ctx.fillStyle = style;
				ctx.fill();
			} else {
				ctx.strokeStyle = style;
				ctx.lineWidth = options.lineWidth || 1;
				ctx.stroke();
			}
		
		}
		
	}
	
}

//
export default draw;
