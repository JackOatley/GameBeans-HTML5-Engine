
/**
 *
 */
export default class Font {

	/**
	 *
	 */
	constructor(opts) {
		this.name = opts.name || "_UNNAMEDFONT";
		this.src = opts.src || "",
		this.bitmap = opts.bitmap || null;
		this.hasBitmap = this.bitmap !== null;
		this.method = opts.method || "normal";
	}
	
}

Font.prototype.assetType = "font";