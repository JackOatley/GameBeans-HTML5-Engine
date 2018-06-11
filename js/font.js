import Generator from "./generator.js"

/**
 *
 */
export default class Font {

	/**
	 *
	 */
	constructor(opts = {}) {
		this.name = opts.name || "_UNNAMEDFONT";
		this.source = opts.src || "";
		this.hasFontFace = false;
		this.bitmapFont = opts.bitmap || null;
		this.hasBitmapFont = this.bitmap !== null;
		this.method = opts.method || "normal";
		if (opts.apply) this.applyCss();
	}
	
	/**
	 *
	 */
	getCss() {
		return "@font-face {\
			font-family: " + this.name + ";\
			src: url('" + this.source + "') format('truetype');\
		}";
	}
	
	/**
	 *
	 */
	applyCss() {
		let style = document.createElement("STYLE");
		style.textContent = this.getCss()
		document.head.appendChild(style);
	}
	
	/**
	 *
	 */
	convertToBitmapFont(opts = {}) {
		let canvas = document.createElement("CANVAS");
		let ctx = canvas.getContext("2d");
		ctx.font = "16px " + this.name;
		let rangeStart = 32;
		let rangeEnd = 128;
		let n;
		for (n=rangeStart; n<rangeEnd; n++) {
			let metrics = ctx.measureText(String.fromCharCode(n));
			console.log(n, String.fromCharCode(n), metrics);
		}
		this.bitmapFont = {
			lookup: null,
			image: null
		}
	}
	
}

Generator.classStaticMatch(Font);
Font.prototype.assetType = "font";