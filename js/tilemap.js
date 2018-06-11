import Generator from "./generator.js";
import Grid from "./data/dataGrid.js";
import draw from "./draw.js";
import Sprite from "./sprite.js";

/**
 * @author Jack Oatley
 */
export default class Tilemap {
	
	/**
	 * @param {object} [opts={}] Options object to define the Tilemap.
	 * @param {sprite} [opts.atlas]
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
			this.__atlas = Sprite.get(this.textureAtlas).images[0].img;
	}
	
	/**
	 * @param {string} layer Name of the player in which to place the tile.
	 * @param {number} x The X grid position to place this tile.
	 * @param {number} y The Y grid position to place this tile.
	 * @param {number} index The tile index.
	 */
	set(layer, x, y, index) {
		if (!this.layers[layer]) {
			this.layers[layer] = new Grid(this.mapWidth, this.mapHeight);
		}
		this.layers[layer].set(x, y, index);
	}
	
	/**
	 * @param {object} [opts={}]
	 * @param {array} [opts.order]
	 * @param {number} [opts.left]
	 * @param {number} [opts.top]
	 * @param {number} [opts.right]
	 * @param {number} [opts.bottom]
	 */
	draw(opts) {
		const atlas = this.__atlas;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const tsw = this.tilesWide;
		const gap = this.__gap;
		const overlay = this.tileOverlay;
		const renderWidth = tw + overlay * 2;
		const renderHeight = th + overlay * 2;
		const order = opts.order || Object.keys(this.layers);
		const startX = ~~(Math.max(0, (opts.left || 0) / tw));
		const startY = ~~(Math.max(0, (opts.top || 0) / th));
		const endX = Math.ceil(Math.min(this.mapWidth, (opts.right || 0) / tw));
		const endY = Math.ceil(Math.min(this.mapHeight, (opts.bottom || 0) / th));
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
						atlas,
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
Generator.classStaticMatch(Tilemap);
Tilemap.prototype.assetType = "tilemap";