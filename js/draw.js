import math from "./math";
import sprite from "./sprite";
import canvas from "./canvas";
import Font from "./font";
import Color from "./Color";

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
	setTarget: function(target) {
		draw.targetStack.push(draw.target);
		draw.target = target;
		draw.context = target.domElement.getContext("2d");
	},

	/** */
	resetTarget: function() {
		let target = draw.targetStack.pop();
		draw.target = target;
		draw.context = target.domElement.getContext( "2d" );
	},

	/** */
	getTarget: function() {
		return draw.target;
	},

	/** */
	clear: function(col) {
		canvas.fill(draw.target, col);
	},

	/** */
	save: function() {
		draw.context.save();
	},

	/** */
	restore: function() {
		draw.context.restore();
	},

	/** */
	reset: function() {
		draw.context.imageSmoothingEnabled = draw.imageSmoothing;
		draw.context.setTransform(...draw.defaultTransform);
		draw.context.globalAlpha = 1;
	},

	/**
	 *
	 */
	setImageSmoothing: function(enable) {
		draw.imageSmoothing = enable;
	},

	//
	transform: {

		scale: function(x, y) {
			draw.context.scale(x, y);
		},

		rotate: function(rot) {
			draw.context.rotate(rot * math.DEGTORAD);
		},

		translate: function(x, y) {
			draw.offsetX = x;
			draw.offsetY = y;
			draw.context.translate(x, y);
		},

		/**
		 * @param {object} [opts={}]
		 */
		setDefault: function( opts = {} ) {
			let trans = draw.defaultTransform;
			if (opts.scaleX) trans[0] = opts.scaleX;
			if (opts.skewX) trans[1] = opts.skewX;
			if (opts.skewY) trans[2] = opts.skewY;
			if (opts.scaleY) trans[3] = opts.scaleY;
			if (opts.moveX) trans[4] = opts.moveX;
			if (opts.moveY) trans[5] = opts.moveY;
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
			if ("r" in c && "g" in c && "b" in c) {
				draw.color = ("a" in c)
					? "rgba("+c.r+","+c.g+","+c.b+","+c.a+")"
					: "rgb("+c.r+","+c.g+","+c.b+")";
			}

			// HSL / HSLA
			else if ("h" in c && "s" in c && "l" in c) {
				draw.color = ("a" in c)
					? "hsla("+c.h+","+c.s+"%,"+c.l+"%,"+c.a+")"
					: "hsl("+c.h+","+c.s+"%,"+c.l+"%)";
			}
		}

	},

	/**
	 * Draws the sprite at the given x, y position.
	 * @param {Object} sprite
	 * @param {number} index
	 * @param {number} x
	 * @param {number} y
	 * @param {number} scaleX
	 * @param {number} scaleY
	 * @param {number} rotation
	 * @param {Object} [opts={}]
	 * @param {number} [originX] Overrides sprite's originX property.
	 * @param {number} [originY] Overrides sprite's originY property.
	 */
	sprite: function(spr, index, x, y, scaleX, scaleY, rotation, opts = {}) {

		spr = sprite.get(spr);

		//
		const ctx = draw.context;
		let ox = spr.originX;
		let oy = spr.originY;
		if (opts.originX !== undefined) ox = opts.originX;
		if (opts.originY !== undefined) oy = opts.originY;

		//
		ctx.save();
		ctx.translate( x, y );
		ctx.rotate( rotation * math.DEGTORAD );
		ctx.scale( scaleX, scaleY );

		//
		index = Math.floor(index || 0) % spr.images.length;

		//
		let frame = spr.images[index];
		let img = frame.img;
		ctx.drawImage(
			img, frame.clip.x, frame.clip.y,
			frame.clip.w, frame.clip.h,
			-ox, -oy,
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
	spriteTiled: function(spr, index, x, y, w, h) {
		spr = sprite.get(spr);
		let dx, dy, rx, ry;
		for (rx=0, dx=x; rx<w; rx++, dx+=spr.width)
		for (ry=0, dy=y; ry<h; ry++, dy+=spr.height) {
			drawSprite(spr, index, dx, dy, 1, 1, 0);
		}
	},

	/**
	 * Draws a canvas at the given position.
	 * @param {canvas} canvas The canvas to draw.
	 * @param {number} x The X position to draw at.
	 * @param {number} y The Y position to draw at.
	 */
	canvas: function(canv, x, y) {
		draw.context.drawImage(canv.domElement, x, y);
	},

	/**
	 * @param {string} font
	 * @param {number} size
	 * @param {string} align Horizontal alignment.
	 * @param {string} baseline Vertical alignment.
	 */
	setFont: function(font, size, align, baseline) {
		font = typeof font === "string" ? font : font.name;
		draw.font = font;
		draw.fontSize = size || 16;
		draw.textAlign = align || "left";
		draw.textBaseline = baseline || "alphabetic";
		const ctx = draw.context;
		ctx.font = draw.fontSize + "px " + font;
		ctx.textAlign = draw.textAlign;
		ctx.textBaseline = draw.textBaseline;
	},

	/**
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 * @param {Object=} opts
	 */
	text: function(text, x, y, opts = {}) {

		x = Number(x);
		y = Number(y);

		let drawSize, bitmap, lookup, scale, useBitmap = false;
		let font = Font.get(draw.font);
		if (font && font.method === "bitmap") {

			drawSize = font.forceSize || draw.fontSize;
			var color = Color.hexToArray(draw.color);
			var key = "" + drawSize + color[0] + color[1] + color[2] + color[3];

			if (!font.bitmapFont[key]) {
				font.convertToBitmapFont({
					size: drawSize,
					color: color
				})
			}

			useBitmap = true;
			lookup = font.bitmapFont[key].lookup
			bitmap = font.bitmapFont[key].image;
			scale = draw.fontSize / font.bitmapFont[key].size;
		}

		//
		let ctx = draw.context;
		let drawMethod = "fillText";
		if (opts.stroke) {
			ctx.strokeStyle = opts.strokeColor || draw.color;
			ctx.lineWidth = opts.lineWidth || 2;
			drawMethod = "strokeText";
		} else {
			ctx.fillStyle = draw.color;
		}

		//
		let lineLength;
		let drawX = x;
		let startN = 0;
		//console.log(text);
		let endN = text.toString().length;
		if (opts.pattern) {
			startN = opts.pattern.start;
			endN = opts.pattern.end;
		}

		//
		let lineHeight = ctx.measureText("M").width * 1.2;
		let lines = text.toString().split("#");
		for (var i=0; i<lines.length; i++) {

			if (opts.maxWidth) {
				var words = lines[i].split(' ');
				var line = '';

				for(var n=0; n<words.length; n++) {

					var testLine = line + words[n] + ' ';
					var metrics = ctx.measureText(testLine);
					var testWidth = metrics.width;
					if (testWidth > opts.maxWidth && n > 0) {

						let a = line.slice(0, startN);
						let b = line.slice(startN, endN);
						//drawX += Draw.measureText(a).width;
						drawX += ctx.measureText(a).width;
						if ( 0 < endN ) {
							_drawWord(drawX, y, b, lookup, ctx, useBitmap, bitmap, scale, drawMethod);
						}
						lineLength = testLine.length;
						startN -= lineLength;
						endN -= lineLength;


						line = words[n] + ' ';
						y += lineHeight;
						drawX = x;
					} else {
						line = testLine;
					}

				}

				let a = line.slice(0, startN);
				let b = line.slice(startN, endN);
				drawX += ctx.measureText(a).width;
				_drawWord(drawX, y, b, lookup, ctx, useBitmap, bitmap, scale, drawMethod);
				lineLength = line.length;

			} else {

				let a = lines[i].slice(0, startN);
				let b = lines[i].slice(startN, endN);
				//console.log(b);
				drawX += ctx.measureText(a).width;
				_drawWord(~~drawX, y, b, lookup, ctx, useBitmap, bitmap, scale, drawMethod);
				lineLength = lines[i].length;

			}

			drawX = x;
			y += lineHeight;
			startN -= lineLength;
			endN -= lineLength;

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
		 * @param {object} [opts={}]
		 */
		line: function(x1, y1, x2, y2, opts = {}) {
			let ctx = draw.context;
			ctx.strokeStyle = opts.color || draw.color;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		},

		/**
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 * @param {object} [opts={}]
		 */
		ellipse: function(x, y, xr, yr, opts = {}) {

			//
			let ctx = draw.context;
			ctx.save();
			ctx.beginPath();
			ctx.translate(x-xr, y-yr);
			ctx.scale(xr, yr);
			ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
			ctx.restore();

			//
			let style;
			if (opts.healthbar) {
				let amount = opts.healthbar.amount || 1;
				let color = opts.healthbar.color || "#0F0";
				let background = opts.healthbar.background || "#F00";
				style = ctx.createLinearGradient( x-xr, 0, x+xr, 0 );
				style.addColorStop( 0, color );
				style.addColorStop( amount, color );
				style.addColorStop( amount, background );
				style.addColorStop( 1, background );
			} else {
				style = opts.color || draw.color;
			}

			//
			if (!opts.fill && !opts.stroke)
				opts.fill = true;

			//
			if (opts.fill) {
				ctx.fillStyle = style;
				ctx.fill();
			}

			if (opts.stroke) {
				ctx.strokeStyle = style
				ctx.lineWidth = opts.lineWidth || 1;
				ctx.stroke();
			}

		},

		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} w
		 * @param {number} h
		 * @param {object} [opts={}]
		 */
		rectangle: function(x, y, w, h, opts = {}) {

			//
			let ctx = draw.context;
			ctx.beginPath();
			ctx.rect(x, y, w, h);

			//
			let style;
			if ( opts.healthbar ) {
				let amount = opts.healthbar.amount || 1;
				let color = opts.healthbar.color || "#0F0";
				let background = opts.healthbar.background || "#F00";
				style = ctx.createLinearGradient(x, 0, x+w, 0);
				style.addColorStop(0, color);
				style.addColorStop(amount, color);
				style.addColorStop(amount, background);
				style.addColorStop(1, background);
			} else {
				style = opts.color || draw.color;
			}

			//
			if (!opts.fill && !opts.stroke)
				opts.fill = true;

			//
			if (opts.fill) {
				ctx.fillStyle = style;
				ctx.fill();
			}

			if (opts.stroke) {
				ctx.strokeStyle = style;
				ctx.lineWidth = opts.lineWidth || 1;
				ctx.stroke();
			}

		}

	}

}

/**
 *
 */
function _drawWord(drawX, drawY, word, lookup, ctx, useBitmap, bitmap, scale, drawMethod) {
	if (useBitmap) {
		let dx = ~~drawX;
		for (var cn=0; cn<word.length; cn++) {
			let metrics = lookup[word[cn]];
			let sx = Math.floor(metrics.left);
			let sy = Math.floor(metrics.top);
			let sw = Math.ceil(metrics.right) - sx;
			let sh = Math.ceil(metrics.bottom) - sy;
			ctx.drawImage(bitmap, sx, sy, sw, sh, dx, drawY, sw*scale, sh*scale);
			dx += (sw + 1) * scale;
		}
	} else {
		ctx[drawMethod](word, drawX, drawY);
	}
}

//
export default draw;
