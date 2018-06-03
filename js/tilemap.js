/**
 * @module Tilemap
 */

//
import Generator from "./generator.js";
import Grid from "./data/dataGrid.js";
import draw from "./draw.js";
import Sprite from "./sprite.js";

/**
 *
 */
export default class Tilemap {
	
	/**
	 * @param {object} opts
	 * @param {sprite} opts.atlas
	 * @param {number} opts.tileWidth
	 * @param {number} opts.tileHeight
	 * @param {number} opts.tileSpacing
	 * @param {number} opts.tileOverlay
	 * @param {number} opts.tilesWide
	 * @param {number} opts.mapWidth
	 * @param {number} opts.mapHeight
	 */
	constructor(opts = {}) {
		this.textureAtlas = opts.atlas || null;
		this.tileWidth = opts.tileWidth || 16;
		this.tileHeight = opts.tileHeight || 16;
		this.tileSpacing = opts.tileSpacing || 0;
		this.tileOverlay = opts.tileOverlay || 0;
		this.tilesWide = opts.tilesWide || 16;
		this.mapWidth = opts.mapWidth || 16;
		this.mapHeight = opts.mapHeight || 16;
		this.layers = {};
		
		this.__gap = this.tileSpacing + this.tileOverlay;
		if (this.textureAtlas)
			this.__atlas = Sprite.get(this.textureAtlas).images[0].img;
	}
	
	/**
	 *
	 */
	set(layer, x, y, index) {
		if (!this.layers[layer]) {
			this.layers[layer] = new Grid(this.mapWidth, this.mapHeight);
		}
		this.layers[layer].set(x, y, index);
	}
	
	/**
	 *
	 */
	draw(opts) {
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const tsw = this.tilesWide;
		const gap = this.__gap;
		const overlay = this.tileOverlay;
		const renderWidth = tw + overlay * 2;
		const renderHeight = th + overlay * 2;
		const order = opts.order || Object.keys(this.layers);
		let startX = ~~(Math.max(0, (opts.left || 0) / tw));
		let startY = ~~(Math.max(0, (opts.top || 0) / th));
		let endX = Math.ceil(Math.min(this.mapWidth, (opts.right || 0) / tw));
		let endY = Math.ceil(Math.min(this.mapHeight, (opts.bottom || 0) / th));
		let x, y, n, layer, tile, iX, iY;
		for (n=0; n<order.length; n++) {
			layer = this.layers[order[n]];
			for (x=startX; x<endX; x++)
			for (y=startY; y<endY; y++) {
				tile = layer.get(x, y) - 1;
				if (tile >= 0) {
					iX = (tile % tsw) * (tw + gap*2) + gap;;
					iY = ~~(tile / tsw) * (th + gap*2) + gap;
					draw.context.drawImage(
						this.__atlas,
						iX - overlay, iY - overlay,
						renderWidth, renderHeight,
						x * tw - overlay, // target x
						y * th - overlay, // target y
						renderWidth, renderHeight
					);
				}
			}
		}
	}
	
}

// Static methods, created via the Generator class
Tilemap.create = Generator.functionFromConstructor(Tilemap);
Tilemap.set = Generator.functionFromMethod(Tilemap.prototype.set);
Tilemap.draw = Generator.functionFromMethod(Tilemap.prototype.draw);