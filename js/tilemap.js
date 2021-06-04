import Grid, * as grid from "./data/grid.js";
import { context } from "./draw.js";

/**
 * @author Jack Oatley
 */
export default class Tilemap {

	/**
	 * @param {Object} [opts={}] Options object to define the Tilemap.
	 * @param {Object} [opts.atlas]
	 * @param {number} [opts.tileWidth]
	 * @param {number} [opts.tileHeight]
	 * @param {number} [opts.tileSpacing]
	 * @param {number} [opts.tileOverlay]
	 * @param {number} [opts.tilesWide]
	 * @param {number} [opts.mapWidth]
	 * @param {number} [opts.mapHeight]
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
			this.__atlas = this.textureAtlas.images[0].img;
	}

	/**
	 * @param {string} layer Name of the player in which to place the tile.
	 * @param {number} x The X grid position to place this tile.
	 * @param {number} y The Y grid position to place this tile.
	 * @param {number} index The tile index.
	 * @return {void}
	 */
	set(layer, x, y, index) {
		if (!this.layers[layer]) {
			this.layers[layer] = new Grid(this.mapWidth, this.mapHeight);
		}
		this.layers[layer].set(x, y, index);
	}

	/**
	 * @param {Object} [opts={}]
	 * @param {Array} [opts.order]
	 * @param {number} [opts.left]
	 * @param {number} [opts.top]
	 * @param {number} [opts.right]
	 * @param {number} [opts.bottom]
	 * @return {void}
	 */
	draw(opts) {
		draw(this, opts);
	}

}

function draw(tm, opts)
{
	//console.time("draw tiles");
	const atlas = tm.__atlas;
	const tw = tm.tileWidth;
	const th = tm.tileHeight;
	const tsw = tm.tilesWide;
	const gap = tm.__gap;
	const overlay = tm.tileOverlay;
	const renderWidth = tw + overlay * 2;
	const renderHeight = th + overlay * 2;
	const order = opts.order ?? Object.keys(tm.layers);
	const startX = ~~(Math.max(0, (opts.left || 0) / tw));
	const startY = ~~(Math.max(0, (opts.top || 0) / th));
	const endX = Math.ceil(Math.min(tm.mapWidth, (opts.right || 0) / tw));
	const endY = Math.ceil(Math.min(tm.mapHeight, (opts.bottom || 0) / th));
	var x, y, layer, tile, iX, iY;
	for (const key of order) {
		layer = tm.layers[key];
		for (y = startY; y < endY; y++)
		for (x = startX; x < endX; x++) {
			tile = grid.get(layer, x, y) - 1;
			if (tile < 0) continue;
			iX = (tile % tsw) * (tw + gap*2) + gap;
			iY = ~~(tile / tsw) * (th + gap*2) + gap;
			context.drawImage(
				atlas,
				iX - overlay, iY - overlay,
				renderWidth, renderHeight,
				x * tw - overlay, // target x
				y * th - overlay, // target y
				renderWidth, renderHeight
			);
		}
	}
	//console.timeEnd("draw tiles");
}

// Static methods, created via the Generator class
//Generator.classStaticMatch(Tilemap);
Tilemap.prototype.assetType = "tilemap";
