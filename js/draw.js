import { DEGTORAD } from "./math.js";
import sprite from "./sprite.js";
import canvas from "./Canvas.js";
import Font from "./font.js";
import Color from "./Color.js";
import * as DrawShapes from "./drawing/DrawShapes.js";

export const shape = DrawShapes;

export let target = null;
export let context = null;
export let offsetX = 0;
export let offsetY = 0;

export let color = "#FFFFFF";
let fontName = "Arial";
let fontSize = 30;
let font = `${fontSize}px ${fontName}`;
let lineHeight = 0;
let textAlign = "start";
let textBaseline = "alphabetic";
let defaultTransform = [1, 0, 0, 1, 0, 0];
let targetStack = [];
let imageSmoothing = false;

/**
 *
 */
export function drawTotalReset() {
	target = null;
	context = null;
	targetStack = [];
	offsetX = 0;
	offsetY = 0;
}

/** */
export function setTarget(newTarget) {
	targetStack.push(target);
	target = newTarget;
	context = target.context;
}

/** */
export function resetTarget() {
	let newTarget = targetStack.pop();
	target = newTarget;
	context = target.context;
}

/** */
export function getTarget() {
	return target;
}

/**
 * @type {function{}:CanvasRenderingContext2D}
 */
export const getContext = () => context;

/** */
export function clear(col) {
	canvas.fill(target, col);
}

/** */
export function save() {
	context.save();
}

/** */
export function restore() {
	context.restore();
}

/** */
export function reset() {
	context.imageSmoothingEnabled = imageSmoothing;
	context.globalAlpha = 1;
	if (context instanceof CanvasRenderingContext2D) {
		context.setTransform.apply(context, defaultTransform);
	}
}

/** */
export function setImageSmoothing(enable) {
	imageSmoothing = enable;
}

/**
 * Can be a number, a hex-value or an object containing R,
 * G, B and optionally A properties or H, S, L and optionally A properties.
 * @type {function(*):void}
 */
export function setColor(c) {

	// quick exit if c is already a CSS color value
	if (typeof c === "string") {
		color = c;
		return;
	}

	// RGB / RGBA
	if (c.r !== undefined && c.g !== undefined && c.b !== undefined) {
		var a = (c.a !== undefined) || 1;
		color = "rgba("+c.r+","+c.g+","+c.b+","+a+")";
	}

	// HSL / HSLA
	else if (c.h !== undefined && c.s !== undefined && c.l !== undefined) {
		var a = (c.a !== undefined) || 1;
		color = "hsla("+c.h+","+c.s+"%,"+c.l+"%,"+a+")";
	}

}

/**
 * Draws the sprite at the given x, y position.
 * @type {function(Object, number, number, number, number, number, number, Object):void}
 */
export function drawSprite(spr, index, x, y, scaleX, scaleY, rotation, opts = {}) {

	if (!spr) return;

	if (!(context instanceof CanvasRenderingContext2D)) {
		window.addConsoleText("#F00", "Sprites are currently only supported in Canvas 2D!");
		return window._GB_stop();
	}

	spr = sprite.get(spr);

	//
	context.save();
	context.translate(x, y);
	context.rotate(rotation * DEGTORAD);
	context.scale(scaleX, scaleY);

	// TODO: What does this do with negative numbers?
	index = Math.floor(index || 0) % spr.images.length;

	//
	const ox = opts.originX ?? spr.originX;
	const oy = opts.originY ?? spr.originY;
	const frame = spr.images[index];
	const img = frame.img;
	context.drawImage(
		img, frame.clip.x, frame.clip.y,
		frame.clip.w, frame.clip.h,
		-ox, -oy,
		spr.width, spr.height
	);

	//
	context.restore();
}

/**
 * @type {function(Object, number, number, number, number, number):void}
 */
export const lives = (spr, x, y, number, order, seperation) => {
	const [xd, yd] = order ? [0, seperation] : [seperation, 0];
	for (let n = 0; n < number; n++)
		drawSprite(spr, 0, x + xd * n, y + yd * n, 1, 1, 0);
}

/**
 * Draws the sprite at the given x, y position.
 * @type {function(Object, number, number, number, number, number):void}
 */
export const spriteTiled = (spr, index, x, y, w, h) => {
	spr = sprite.get(spr);
	for (let rx=0, dx=x; rx<w; rx++, dx+=spr.width)
	for (let ry=0, dy=y; ry<h; ry++, dy+=spr.height)
		drawSprite(spr, index, dx, dy, 1, 1, 0);
}

/**
 * Draws a canvas at the given position.
 * @type {function(HTMLCanvasElement, number, number):void}
 */
export const drawCanvas = (canv, x, y) => {
	context.drawImage(canv.domElement, x, y);
}

/**
 *
 */
export const setShadow = (color, blur, x, y) => {
	context.shadowColor = color;
	context.shadowBlur = blur;
	context.shadowOffsetX = x;
	context.shadowOffsetY = y;
}

/**
 * @type {function(string, number, string, string):void}
 */
export function setFont(font, size = 16, align = "left", baseline = alphabetic) {
	fontName = typeof font === "string" ? font : font.name;
	fontSize = size;
	context.font = `${fontSize}px ${fontName}`;
	context.textAlign = textAlign = align;
	context.textBaseline = textBaseline = baseline;
}

/**
 *
 */
export function setFontSize(size = 16) {
	fontSize = size;
	context.font = `${fontSize}px ${fontName}`;
}

/**
 * @type {function(string, number, number, Object=):void}
 */
export function text(str, x, y, opts = {}) {

	x = Number(x);
	y = Number(y);

	let drawSize, bitmap, lookup, scale, useBitmap = false;
	let fontActual = Font.get(font);
	if (fontActual && fontActual.method === "bitmap") {

		drawSize = fontActual.forceSize || fontSize;
		var c = Color.hexToArray(color);
		var key = "" + drawSize + c[0] + c[1] + c[2] + c[3];

		if (!fontActual.bitmapFont[key]) {
			fontActual.convertToBitmapFont({
				size: drawSize,
				color: c
			});
		}

		useBitmap = true;
		lookup = fontActual.bitmapFont[key].lookup
		bitmap = fontActual.bitmapFont[key].image;
		scale = fontSize / fontActual.bitmapFont[key].size;
	}

	//
	let drawMethod = "fillText";
	if (opts.stroke) {
		context.strokeStyle = opts.strokeColor || color;
		context.lineWidth = opts.lineWidth || 2;
		drawMethod = "strokeText";
	} else {
		context.fillStyle = color;
	}

	//
	let lineLength;
	let drawX = x;
	let startN = 0;
	let endN = str.toString().length;
	//if (opts.pattern) {
		//startN = opts.pattern.start;
		//endN = opts.pattern.end;
	//}

	//
	let lineHeightActual = lineHeight || context.measureText("Mp").width * 1.2;
	let lines = str.toString().split("#");
	for (var i=0; i<lines.length; i++) {

		if (opts.maxWidth) {
			var words = lines[i].split(' ');
			var line = '';

			for(var n=0; n<words.length; n++) {

				var testLine = line + words[n] + ' ';
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;
				if (testWidth > opts.maxWidth && n > 0) {

					let a = line.slice(0, startN);
					let b = line.slice(startN, endN);
					drawX += context.measureText(a).width;
					if ( 0 < endN ) {
						_drawWord(drawX, y, b, lookup, context, useBitmap, bitmap, scale, drawMethod);
					}
					lineLength = testLine.length;
					startN -= lineLength;
					endN -= lineLength;


					line = words[n] + ' ';
					y += lineHeightActual;
					drawX = x;
				} else {
					line = testLine;
				}

			}

			let a = line.slice(0, startN);
			let b = line.slice(startN, endN);
			drawX += context.measureText(a).width;
			_drawWord(drawX, y, b, lookup, context, useBitmap, bitmap, scale, drawMethod);
			lineLength = line.length;

		} else {

			let t = lines[i];
			if (useBitmap && context.textAlign === "center") {
				drawX -= context.measureText(t).width / 2;
			}
			_drawWord(~~drawX, y, t, lookup, context, useBitmap, bitmap, scale, drawMethod);

		}

		drawX = x;
		y += lineHeightActual;

	}



}

export const transform = {

	scale: (x, y) => {
		context.scale(x, y);
	},

	rotate: (rot) => {
		context.rotate(rot * DEGTORAD);
	},

	translate: (x, y) => {
		offsetX = x;
		offsetY = y;
		context.translate(x, y);
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
