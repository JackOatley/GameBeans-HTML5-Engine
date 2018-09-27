import Generator from "./generator";
import Color from "./Color";

/**
 *
 */
class Sprite {

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
		this.name = opts.name || newSpriteName();
		this.originX = opts.originX || 0;
		this.originY = opts.originY || 0;
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
	 *
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
				if (this.width * this.height === 0 ) {
					this.width = image.clip.w;
					this.height = image.clip.h;
				}
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

	/**
	 *
	 */
	cache(opts = {}) {

		//
		this.images.forEach((frame) => {
			let canvas = document.createElement("CANVAS");
			canvas.width = opts.width || frame.img.width;
			canvas.height = opts.height || frame.img.height;
			let ctx = canvas.getContext("2d");
			ctx.drawImage(frame.img, 0, 0, canvas.width+1, canvas.height+1);
			frame.__orig = Object.assign({}, frame);
			frame.clip.x = 0;
			frame.clip.y = 0;
			frame.clip.w = canvas.width;
			frame.clip.h = canvas.height;
			frame.img = canvas;
		});

	}

	/**
	 *
	 */
	restore(options = {}) {
		this.images.forEach((frame) => {
			if (frame.__orig) frame = frame._orig;
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
	 * Tints the sprite to the given color. Effects all frames.
	 * @param {string} col A CSS color value.
	 * @return {void}
	 */
	tint(col) {

		//
		this.images.forEach((frame) => {

			// create canvas, draw image
			let canvas = document.createElement("CANVAS");
			let ctx = canvas.getContext("2d");
			canvas.width = this.width;
			canvas.height = this.height;
			frame.img = frame.__orig || frame.img;
			ctx.drawImage(frame.img, 0, 0);

			// get data, do thing, put data back
			let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			let color = (typeof col === "object") ? col : Color.hexToRgb(col);
			pixelDataTint(imageData.data, color);
			ctx.putImageData(imageData, 0, 0);

			//
			frame.__orig = frame.img;
			frame.__origSrc = frame.img.src;
			frame.img = canvas;

		});

	}

	/**
	 * @return {boolean}
	 */
	static readyAll() {

		var sa = Sprite.array;
		var n = sa.length;
		while (n--) {
			var ia = sa[n].images;
			var i = ia.length;
			while (i--) {
				if (!ia[i].ready) {
					return false;
				}
			}
		}

		return true;

	}

	/**
	 * @param {*} name String or Object.
	 * @return {Object}
	 */
	static get(name) {

		if (typeof name === "object") {
			return name;
		}

		var n = Sprite.array.length;
		while (n--) {
			if (Sprite.array[n].name === name) {
				return Sprite.array[n];
			}
		}

		return null;

	}

}

/**
 * Generates a new, unused, sprite name.
 * @return {string}
 */
function newSpriteName() {
	return "Sprite_" + Sprite.array.length;
}

/**
 * Iterates pixel data and tints (multiplies) it with the given color.
 * @param {Uint8ClampedArray} data
 * @param {Object} rgb
 * @return {void}
 */
function pixelDataTint(data, rgb) {
	var r = rgb.r / 255;
	var g = rgb.g / 255;
	var b = rgb.b / 255;
	var i = data.length;
	while (i -= 4) {
		data[i] *= r;
		data[i + 1] *= g;
		data[i + 2] *= b;
	}
}

//
Generator.classStaticMatch(Sprite);
Sprite.names = [];
Sprite.array = [];

//
export default Sprite;
