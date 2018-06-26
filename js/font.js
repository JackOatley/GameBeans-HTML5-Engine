import Generator from "./generator";
import Grid from "./data/grid";

/**
 * @author Jack Oatley
 */
export default class Font {

	/**
	 * @param {object} [opts={}] Options.
	 * @param {string} [opts.name="_UNNAMEDFONT"] Name of the font.
	 * @param {string} [opts.src=""] Source of the font.
	 * @param {image} [opts.bitmap=null] An existing bitmap.
	 * @param {string} [opts.method="normal"] Initial drawing method.
	 * @param {boolean} [opts.apply] Apply the font in CSS,
	 */
	constructor(opts = {}) {
		this.name = opts.name || "_UNNAMEDFONT";
		this.source = opts.src || "";
		this.hasFontFace = false;
		this.bitmapFont = opts.bitmap || null;
		this.hasBitmapFont = this.bitmap !== null;
		this.method = opts.method || "normal";
		if (opts.apply) this.applyCss();
		Font.names.push(this.name);
		Font.array.push(this);
	}
	
	/**
	 * Returns the CSS code that's needed to be applied to the page to use this font in the DOM or on the canvas.
	 */
	getCss() {
		return "@font-face {\
			font-family: " + this.name + ";\
			src: url('" + this.source + "') format('truetype');\
		}";
	}
	
	/**
	 * Applies the CSS code.
	 */
	applyCss() {
		let style = document.createElement("STYLE");
		style.textContent = this.getCss()
		document.head.appendChild(style);
	}
	
	/**
	 * @param {object} [opts={}] Options object.
	 * @param {number} [opts.size=8] Size of the font.
	 * @param {string} [opts.map] A string of all the characters to include in the bitmap font.
	 * @param {int} [opts.alphaThreshold=150] Threshold that dertmines which pixels shall be visible.
	 * @param {array} [opts.color=[0,0,0,255]] An array containing the RGBA channels respectively.
	 */
	convertToBitmapFont(opts = {}) {
		
		const scale = 3;
		const size = (opts.size || 8) * scale;
		const map = opts.map || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const cx = size * 0.5;
		const cy = cx;
		const alphaThreshold = opts.alphaThreshold || 150;
		const color = opts.color || [0, 0, 0, 255];
		
		const atlas = document.createElement("CANVAS");
		atlas.width = (size /scale) * map.length;
		atlas.height = (size / scale);
		const atlasCtx = atlas.getContext("2d");
		const pointImageData = atlasCtx.createImageData(1, 1);
		pointImageData.data.set(color, 0);
		
		const canvas = document.createElement("CANVAS");
		canvas.width = canvas.height = size;
		
		let ctx = canvas.getContext("2d");
		ctx.font = size + "px " + this.name;
		console.log(ctx.font);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle"; 
		
		let charMap = new Grid(size/scale, size/scale);
		let lookupTable = {};
		for (var n=0; n<map.length; n++) {
			
			ctx.clearRect(0, 0, size, size);
			charMap.clear(-1);
			
			let c = map[n];
			ctx.fillStyle = "#000000";
			ctx.fillText(c, cx, cy);
			
			let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			let data = imageData.data;
			var p, r, g, b, a;
			for (p=0; p<data.length; p+=4) {
				let x = ~~(((p/4) % size) / scale);
				let y = ~~((~~((p/4) / size)) / scale);
				let i = x+(size/scale)*y;
				if (charMap.get(x, y) === -1) charMap.set(x, y, data[p+3]);
			}
			
			// Get metrics
			let metrics = { left: 100, top: 100, right: 0, bottom: 0 };
			let minY = 100;
			let maxY = 0;
			let x, y;
			for (y=0; y<size/scale; y++)
			for (x=0; x<size/scale; x++) {
				if (charMap.get(x, y) > alphaThreshold) {
					metrics.left = Math.min(metrics.left, x);
					metrics.top = Math.min(metrics.top, y);
					metrics.right = Math.max(metrics.right, x+1);
					metrics.bottom = Math.max(metrics.bottom, y+1);
					minY = Math.min(minY, metrics.top);
					maxY = Math.max(maxY, metrics.bottom);
				}
			}
			
			// Print to atlas
			for (y=0; y<size/scale; y++)
			for (x=0; x<size/scale; x++) {
				if (charMap.get(x, y) > alphaThreshold) {
					atlasCtx.putImageData(pointImageData, n*(size/scale)+x, y);
				}
			}
			
			// Tweak metrics into atlas coords and add to lookup table
			metrics.left += n*(size/scale);
			metrics.right += n*(size/scale);
			metrics.top = 0;
			metrics.bottom = size/scale;
			lookupTable[c] = metrics;
		}
		
		// Space is special because it can't actually be measured
		lookupTable[" "] = {left: -3, top: 0, right: 0, bottom: size/scale}
		
		this.bitmapFont = {
			size: size/scale,
			lookup: lookupTable,
			image: atlas
		}
		
		this.method = "bitmap";
		console.log(this.bitmapFont);
		
	}
	
	/**
	 * @param {*} value The string name of the font to get.
	 */
	static get(value) {
		
		if (["object", "function"].includes(typeof value))
		if (typeof value === "object" || typeof value === "function")
			return value;
		
		for (var n = 0; n < Font.array.length; n++)
			if (Font.array[n].name === value)
				return Font.array[n];
		
		return null;
		
	}
	
}

Generator.classStaticMatch(Font);
Font.prototype.assetType = "font";
Font.names = [];
Font.array = [];