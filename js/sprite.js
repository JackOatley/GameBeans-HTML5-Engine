import Canvas from "./Canvas.js";
import * as Color from "./Color.js";

/**
 *
 */
export class Sprite {

	/**
	 *
	 */
	constructor(opts = {}) {

		//
		let atlas, atlasIndex;
		if (opts.atlas) {
			atlasIndex = opts.atlasIndex || 0;
			atlas = opts.atlas.images[atlasIndex];
		}

		//
		this.assetType = "sprite";
		this.name = opts.name;
		this.originX = opts.originX ?? 0;
		this.originY = opts.originY ?? 0;
		this.width = 0;
		this.height = 0;
		this.images = [];

		//
		if (opts.frames) {
			opts.frames.forEach((frame) => {
				this.addFrame({
					source: frame.src
				});
			});
		}

		//
		let length = Sprite.array.length;
		Sprite.names[length] = this.name;
		Sprite.array[length++] = this;

	}

	/**
	 * @return {void}
	 */
	addFrame(opts = {}) {

		//
		let atlas;
		if (opts.atlas) {
			atlas = Sprite.get(opts.atlas).images[0].img;
		}

		let image = {
			img: atlas || new Image(),
			clip: null,
			ready: false
		}

		//
		if (opts.source) {

			image.img.onload = () => {

				image.ready = true;
				image.clip = {
					x: 0,
					y: 0,
					w: image.img.width,
					h: image.img.height
				}

				//
				if (this.width * this.height === 0) {
					this.width = image.clip.w;
					this.height = image.clip.h;
				}

				image.original = image.img;
				createImageBitmap(image.img, 0, 0, this.width, this.height)
					.then(bmp => image.img = bmp);

			}
			image.img.src = opts.source || "";

		}

		//
		if (atlas && opts.clip) {
			image.ready = true;
			image.clip = opts.clip;
			if (this.width * this.height === 0) {
				this.width = image.clip.w;
				this.height = image.clip.h;
			}
		}

		//
		this.images.push(image);

	}

	cache(opts) {
		cache(this, opts);
	}

	/**
	 * @return {void}
	 */
	restore() {
		this.images.forEach((frame) => {
			if (frame.__orig) frame = frame.__orig;
			if (frame.__origSrc) frame.img.src = frame.__origSrc;
		});
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {void}
	 */
	setOrigin(x, y) {
		this.originX = Number(x);
		this.originY = Number(y);
	}

	/**
	 * Tints (multiplies) the sprite to the given color. Effects all frames.
	 * @param {string} col A CSS color value.
	 * @return {void}
	 */
	tint(col) {

		var n = this.images.length;
		while (n--) {
			var frame = this.images[n];

			// Create canvas, draw image.
			var canvas = document.createElement("CANVAS");
			var ctx = canvas.getContext("2d");
			canvas.width = this.width;
			canvas.height = this.height;
			frame.img = frame.__orig || frame.img;
			ctx.drawImage(frame.img, 0, 0);

			// Get data, do thing, put data back.
			var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var color = (typeof col === "object") ? col : Color.hexToRgb(col);
			pixelDataTint(imageData.data, color);
			ctx.putImageData(imageData, 0, 0);

			// Cache old image, then set new one.
			frame.__orig = frame.img;
			frame.__origSrc = frame.img.src;
			frame.img = canvas;

		}

	}

	/**
	 * Tints (multiplies) the sprite to the given color. Effects all frames.
	 * @param {string} col A CSS color value.
	 * @return {void}
	 */
	fade(col) {

		var n = this.images.length;
		while (n--) {
			var frame = this.images[n];

			// Create canvas, draw image.
			let canvas = document.createElement("CANVAS");
			let ctx = canvas.getContext("2d");
			canvas.width = this.width;
			canvas.height = this.height;
			frame.img = frame.__orig || frame.img;
			ctx.drawImage(frame.img, 0, 0);

			// Get data, do thing, put data back.
			let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			let color = (typeof col === "object") ? col : Color.hexToRgb(col);
			pixelDataFade(imageData.data, color);
			ctx.putImageData(imageData, 0, 0);

			// Cache old image, then set new one.
			frame.__orig = frame.img;
			frame.__origSrc = frame.img.src;
			frame.img = canvas;

		}

	}

	/**
	 * @param {number} index The index of the frame to draw onto the canvas.
	 * @return {Object}
	 */
	toCanvas(index) {
		var c = new Canvas({
			width: this.width,
			height: this.height
		})
		var img = this.images[index].img;
		c.context.drawImage(img, 0, 0);
		return c;
	}

	/**
	 * Returns the RGBA components of a pixel on the Sprite as an
	 * ArrayBuffer.
	 */
	getPixel(index, x, y) {
		var c = this.toCanvas(index);
		return c.context.getImageData(x, y, 1, 1).data;
	}
}

Sprite.cache = cache;
Sprite.create = create;
Sprite.readyAll = readyAll;
Sprite.getByName = getByName;

export function create(opts)
{
	return new Sprite(opts);
}

export function readyAll()
{
	for (const sprite of Sprite.array) {
		var images = sprite.images;
		if (!images.some(i => i.ready))
			return false;
	}
	return true;
}

export function cache(sprite, opts = {})
{
	for (const frame of sprite.images) {
		let canvas = document.createElement("canvas");
		canvas.width = opts.width || frame.img.width;
		canvas.height = opts.height || frame.img.height;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(frame.original, 0, 0, canvas.width+1, canvas.height+1);
		frame.__orig = Object.assign({}, frame);
		frame.clip.x = 0;
		frame.clip.y = 0;
		frame.clip.w = canvas.width;
		frame.clip.h = canvas.height;
		frame.img = canvas;
	}
}

export function getByName(name)
{
	return Sprite.array.find(s => s.name === name);
}

/**
 * Tints (multiplies) the sprite with the given color.
 */
function pixelDataTint(data, {r, g, b})
{
	r /= 255;
	g /= 255;
	b /= 255;
	const l = data.length;
	for (let i = 0; i < l; i += 4) {
		data[i] *= r;
		data[i + 1] *= g;
		data[i + 2] *= b;
	}
}

/**
 * Fades the given color of the sprite.
 */
function pixelDataFade(data, {r, g, b, a})
{
	a /= 255;
	r *= a;
	g *= a;
	b *= a;
	const o = 1 - a;
	const l = data.length;
	for (let i = 0; i < l; i += 4) {
		data[i] = r + data[i] * o;
		data[i + 1] = g + data[i + 1] * o;
		data[i + 2] = b + data[i + 2] * o;
	}
}

//
Sprite.names = [];
Sprite.array = [];
