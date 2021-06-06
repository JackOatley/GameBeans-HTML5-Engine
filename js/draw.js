import {DEGTORAD} from "./math.js";
import * as canvas from "./Canvas.js";
import Font from "./font.js";
import * as Color from "./Color.js";
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

//
export function drawTotalReset()
{
	target = null;
	context = null;
	targetStack = [];
	offsetX = 0;
	offsetY = 0;
}

//
export function setTarget(newTarget)
{
	targetStack.push(target);
	target = newTarget;
	context = target.context;
}

//
export function resetTarget()
{
	target = targetStack.pop();
	context = target.context;
}

//
export function getTarget()
{
	return target;
}

//
export function getContext()
{
	return context;
}

//
export function clear(col, alpha)
{
	canvas.clear(target);
	canvas.fill(target, col, alpha);
}

/** */
export function save()
{
	context.save();
}

///
export function restore()
{
	context.restore();
}

//
export function reset()
{
	context.imageSmoothingEnabled = imageSmoothing;
	context.globalAlpha = 1;
	context.setTransform.apply(context, defaultTransform);
}

//
export function setImageSmoothing(enable)
{
	imageSmoothing = enable;
}

/**
 * Can be a number, a hex-value or an object containing R, G, B and optionally A
 * properties or H, S, L and optionally A properties.
 */
export function setColor(c)
{
	if (typeof(c) === "string")
		return color = c;

	if ("r" in c && "g" in c && "b" in c)
		return color = Color.rgbaToCSS(c.r, c.g, c.b, c.a);

	if ("h" in c && "s" in c && "l" in c)
		return color = Color.hslaToCSS(c.h, c.s, c.l, c.a);
}

/**
 * Draws the sprite at the given x, y position.
 */
export function drawSprite(spr, i, x, y, sX, sY, rotation, opts = {})
{
	if (!spr) return;

	if (spr.images === undefined) {
		window.addConsoleText("red", `String of "${spr}" found. Provide a sprite instead.`);
		return window._GB_stop();
	}

	i = Math.floor(i ?? 0) % spr.images.length;
	if (i < 0) i+= spr.images.length;
	const frame = spr.images[i];
	if (!frame?.ready)
		return;

	const ox = opts.originX ?? spr.originX;
	const oy = opts.originY ?? spr.originY;
	const img = frame.img;

	if (rotation === 0 && sX === 1 && sY === 1)
		drawImage(spr, img, frame, x, y, ox, oy);
	else
		drawImageExt(spr, img, frame, x, y, ox, oy, sX, sY, rotation);
}

function drawImage(spr, img, frame, x, y, ox, oy)
{
	context.drawImage(
		img, frame.clip.x, frame.clip.y,
		frame.clip.w, frame.clip.h,
		x-ox, y-oy,
		spr.width, spr.height
	);
}

function drawImageExt(spr, img, frame, x, y, ox, oy, sX, sY, r)
{
	context.save();
	context.translate(x, y);
	context.rotate(r * DEGTORAD);
	context.scale(sX, sY);
	context.drawImage(
		img, frame.clip.x, frame.clip.y,
		frame.clip.w, frame.clip.h,
		-ox, -oy,
		spr.width, spr.height
	);
	context.restore();
}

/**
 * @type {function(Object, number, number, number, number, number):void}
 */
export function lives(spr, x, y, number, order, seperation)
{
	const [xd, yd] = order ? [0, seperation] : [seperation, 0];
	for (let n = 0; n < number; n++)
		drawSprite(spr, 0, x + xd * n, y + yd * n, 1, 1, 0);
}

/**
 * Draws the sprite at the given x, y position, and tiles it to fill a given
 * width and height.
 */
export function spriteTiled(spr, i, x, y, w, h)
{
	const sw = spr.width;
	const sh = spr.height;
	for (let rx = 0, dx = x; rx < w; rx++, dx += sw)
	for (let ry = 0, dy = y; ry < h; ry++, dy += sh)
		drawSprite(spr, i, dx, dy, 1, 1, 0);
}

/**
 * Draws a canvas at the given position.
 */
export function drawCanvas(canv, x, y)
{
	context.drawImage(canv.domElement, x, y);
}

/**
 *
 */
export function setShadow(color, blur, x, y)
{
	context.shadowColor = color;
	context.shadowBlur = blur;
	context.shadowOffsetX = x;
	context.shadowOffsetY = y;
}

/**
 * @type {function(string, number, string, string):void}
 */
export function setFont(font, size = 16, align = "left", baseline = alphabetic)
{
	fontName = typeof font === "string" ? font : font.name;
	fontSize = size;
	context.font = `${fontSize}px ${fontName}`;
	context.textAlign = textAlign = align;
	context.textBaseline = textBaseline = baseline;
}

/**
 *
 */
export function setFontSize(size = 16)
{
	fontSize = size;
	context.font = `${fontSize}px ${fontName}`;
}

/**
 * @type {function(string, number, number, Object=):void}
 */
export function text(str, x, y, opts = {})
{
	x = Number(x);
	y = Number(y);

	let drawSize, bitmap, lookup, scale, useBitmap = false;
	let fontActual = font;
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
						drawWord(drawX, y, b, lookup, context, useBitmap, bitmap, scale, drawMethod);
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
			drawWord(drawX, y, b, lookup, context, useBitmap, bitmap, scale, drawMethod);
			lineLength = line.length;

		} else {

			let t = lines[i];
			if (useBitmap && context.textAlign === "center") {
				drawX -= context.measureText(t).width / 2;
			}
			drawWord(~~drawX, y, t, lookup, context, useBitmap, bitmap, scale, drawMethod);

		}

		drawX = x;
		y += lineHeightActual;

	}
}

function drawWord(x, y, word, lookup, ctx, useBitmap, bitmap, scale, method)
{
	if (useBitmap)
		drawBitmapWord(x, y, word, lookup, ctx, scale);
	else
		ctx[method](word, x, y);
}

function drawBitmapWord(x, y, word, lookup, ctx, scale)
{
	var dx = ~~x;
	for (const char of word) {
		const metrics = lookup[char];
		if (!metrics) continue;
		const sx = ~~metrics.left;
		const sy = ~~metrics.top;
		const sh = Math.ceil(metrics.bottom) - sy;
		const sw = Math.ceil(metrics.right) - sx;
		ctx.drawImage(bitmap, sx, sy, sw, sh, dx, y, sw*scale, sh*scale);
		dx += (sw + 1) * scale;
	}
}

/**
 * Transformation functions.
 */
export function scale(x, y)
{
	context.scale(x, y);
}

export function rotate(rot)
{
	context.rotate(rot * DEGTORAD);
}

export function translate(x, y)
{
	offsetX = x;
	offsetY = y;
	context.translate(x, y);
}
