import math from "./math";
import sprite from "./sprite";
import canvas from "./Canvas";
import Font from "./font";
import Color from "./Color";
import DrawShapes from "./drawing/DrawShapes";

//
class Draw {

	/** */
	static setTarget(target) {
		Draw.targetStack.push(Draw.target);
		Draw.target = target;
		Draw.context = target.context;
	}

	/** */
	static resetTarget() {
		let target = Draw.targetStack.pop();
		Draw.target = target;
		Draw.context = target.context;
	}

	/** */
	static getTarget() {
		return Draw.target;
	}

	/** */
	static clear(col) {
		canvas.fill(Draw.target, col);
	}

	/** */
	static save() {
		Draw.context.save();
	}

	/** */
	static restore() {
		Draw.context.restore();
	}

	/** */
	static reset() {
		Draw.context.imageSmoothingEnabled = Draw.imageSmoothing;
		Draw.context.globalAlpha = 1;
		if (Draw.context instanceof CanvasRenderingContext2D) {
			Draw.context.setTransform.apply(Draw.context, Draw.defaultTransform);
		}
	}

	/** */
	static setImageSmoothing(enable) {
		Draw.imageSmoothing = enable;
	}

	/**
	 * @param {*} c Can be a number, a hex-value or an object containing R,
	 * G, B and optionally A properties or H, S, L and optionally A properties.
	 * @return {void}
	 */
	static setColor(c) {

		// quick exit if c is already a CSS color value
		if (typeof c === "string") {
			Draw.color = c;
			return;
		}

		// RGB / RGBA
		if ("r" in c && "g" in c && "b" in c) {
			var a = "a" in c ? c.a : 1;
			Draw.color = "rgba("+c.r+","+c.g+","+c.b+","+a+")";
		}

		// HSL / HSLA
		else if ("h" in c && "s" in c && "l" in c) {
			var a = "a" in c ? c.a : 1;
			Draw.color = "hsla("+c.r+","+c.g+","+c.b+","+a+")";
		}

	}

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
	 * @return {void}
	 */
	static sprite(spr, index, x, y, scaleX, scaleY, rotation, opts = {}) {

		if (!spr) {
			return;
		}

		var ctx = Draw.context;
		if (!(ctx instanceof CanvasRenderingContext2D)) {
			window.addConsoleText("#F00", "Sprites are currently only supported in Canvas 2D!");
			window._GB_stop();
			return;
		}

		spr = sprite.get(spr);

		//
		var ox = (opts.originX !== undefined) ? opts.originX : spr.originX;
		var oy = (opts.originY !== undefined) ? opts.originY : spr.originY;

		//
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotation * math.DEGTORAD);
		ctx.scale(scaleX, scaleY);

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
	}

	/**
	 * Draws the sprite at the given x, y position.
	 * @param {sprite} sprite
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	static spriteTiled(spr, index, x, y, w, h) {
		spr = sprite.get(spr);
		let dx, dy, rx, ry;
		for (rx=0, dx=x; rx<w; rx++, dx+=spr.width)
		for (ry=0, dy=y; ry<h; ry++, dy+=spr.height) {
			drawSprite(spr, index, dx, dy, 1, 1, 0);
		}
	}

	/**
	 * Draws a canvas at the given position.
	 * @param {canvas} canvas The canvas to draw.
	 * @param {number} x The X position to draw at.
	 * @param {number} y The Y position to draw at.
	 */
	static canvas(canv, x, y) {
		Draw.context.drawImage(canv.domElement, x, y);
	}

	/**
	 * @param {string} font
	 * @param {number} size
	 * @param {string} align Horizontal alignment.
	 * @param {string} baseline Vertical alignment.
	 * @return {void}
	 */
	static setFont(font, size, align, baseline) {
		var ctx = Draw.context;
		font = typeof font === "string" ? font : font.name;
		Draw.font = font;
		Draw.fontSize = size || 16;
		ctx.font = Draw.fontSize + "px " + font;
		ctx.textAlign = Draw.textAlign = align || "left";
		ctx.textBaseline = Draw.textBaseline = baseline || "alphabetic";
	}

	/**
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 * @param {Object=} opts
	 * @return {void}
	 */
	static text(text, x, y, opts = {}) {

		x = Number(x);
		y = Number(y);

		let drawSize, bitmap, lookup, scale, useBitmap = false;
		let font = Font.get(Draw.font);
		if (font && font.method === "bitmap") {

			drawSize = font.forceSize || Draw.fontSize;
			var c = Color.hexToArray(Draw.color);
			var key = "" + drawSize + c[0] + c[1] + c[2] + c[3];

			if (!font.bitmapFont[key]) {
				font.convertToBitmapFont({
					size: drawSize,
					color: c
				});
			}

			useBitmap = true;
			lookup = font.bitmapFont[key].lookup
			bitmap = font.bitmapFont[key].image;
			scale = Draw.fontSize / font.bitmapFont[key].size;
		}

		//
		let ctx = Draw.context;
		let drawMethod = "fillText";
		if (opts.stroke) {
			ctx.strokeStyle = opts.strokeColor || Draw.color;
			ctx.lineWidth = opts.lineWidth || 2;
			drawMethod = "strokeText";
		} else {
			ctx.fillStyle = Draw.color;
		}

		//
		let lineLength;
		let drawX = x;
		let startN = 0;
		let endN = text.toString().length;
		//if (opts.pattern) {
			//startN = opts.pattern.start;
			//endN = opts.pattern.end;
		//}

		//
		let lineHeight = Draw.lineHeight || ctx.measureText("Mp").width * 1.2;
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

				let t = lines[i];
				if (useBitmap && ctx.textAlign === "center") {
					drawX -= ctx.measureText(t).width / 2;
				}
				_drawWord(~~drawX, y, t, lookup, ctx, useBitmap, bitmap, scale, drawMethod);

			}

			drawX = x;
			y += lineHeight;

		}



	}

}

Draw.color = "#FFFFFF";
Draw.font = "Arial";
Draw.fontSize = 30;
Draw.lineHeight = 0;
Draw.textAlign = "start";
Draw.textBaseline = "alphabetic";
Draw.target = null;
Draw.context = null;
Draw.defaultTransform = [1, 0, 0, 1, 0, 0];
Draw.targetStack = [];
Draw.imageSmoothing = false;
Draw.offsetX = 0;
Draw.offsetY = 0;
Draw.shape = DrawShapes;

Draw.transform = {

	scale: function(x, y) {
		Draw.context.scale(x, y);
	},

	rotate: function(rot) {
		Draw.context.rotate(rot * math.DEGTORAD);
	},

	translate: function(x, y) {
		Draw.offsetX = x;
		Draw.offsetY = y;
		Draw.context.translate(x, y);
	}
}

/**
 *
 */
function _drawWord(drawX, drawY, word, lookup, ctx, useBitmap, bitmap, scale, drawMethod) {
	if (useBitmap) {
		var dx = ~~drawX;
		var len = word.length;
		for (var cn=0; cn<len; cn++) {
			var metrics = lookup[word[cn]];
			if (!metrics) continue;
			var sx = ~~metrics.left;
			var sy = ~~metrics.top;
			var sh = Math.ceil(metrics.bottom) - sy;
			var sw = Math.ceil(metrics.right) - sx;
			ctx.drawImage(bitmap, sx, sy, sw, sh, dx, drawY, sw*scale, sh*scale);
			dx += (sw + 1) * scale;
		}
	} else {
		ctx[drawMethod](word, drawX, drawY);
	}
}

//
export default Draw;
