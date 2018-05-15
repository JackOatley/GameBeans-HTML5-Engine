/**
 * @module Tilemap
 */

//
import generator from "./generator.js";
import Grid from "./data/dataGrid.js";
import draw from "./draw.js";
import sprite from "./sprite.js";

/**
 *
 */
function Tilemap( options = {} ) {
	
	//
	this.textureAtlas = options.atlas || null;
	this.tileWidth = options.tileWidth || 16;
	this.tileHeight = options.tileHeight || 16;
	this.tileSpacing = options.tileSpacing || 0;
	this.tileOverlay = options.tileOverlay || 0;
	this.tilesWide = options.tilesWide || 16;
	this.mapWidth = options.mapWidth || 16;
	this.mapHeight = options.mapHeight || 16;
	this.layers = {};
	
}

/**
 *
 */
Tilemap.prototype.set = function( layer, x, y, index ) {

	if ( !this.layers[layer] ) {
		this.layers[layer] = new Grid( this.mapWidth, this.mapHeight );
	}
	
	this.layers[layer].set( x, y, index );

}

//
Tilemap.prototype.draw = function( options ) {

	// cache
	let atlas = sprite.get( this.textureAtlas ).images[0].img;
	let gap = this.tileSpacing + this.tileOverlay;
	
	//
	let startX, startY, endX, endY, order;
	if ( options ) {
		order = options.order;
		startX = Math.floor(Math.max( 0, options.left / this.tileWidth ));
		startY = Math.floor(Math.max( 0, options.top / this.tileHeight ));
		endX = Math.ceil(Math.min( this.mapWidth, options.right / this.tileWidth ));
		endY = Math.ceil(Math.min( this.mapHeight, options.bottom / this.tileHeight ));
	} else {
		order = Object.keys( this.layers );
		startX = 0;
		startY = 0;
		endX = this.mapWidth;
		endY = this.mapHeight;
	}
	
	let name, x, y, n;
	for ( n=0; n<order.length; n++ ) {
		for ( x=startX; x<endX; x++ ) {
			for ( y=startY; y<endY; y++ ) {
				
				var tile = this.layers[order[n]].get( x, y );
				if ( tile > 0 ) {
					
					let iX = ( tile - 1 ) % this.tilesWide;
					let iY = Math.floor( ( tile - 1 ) / this.tilesWide );
					iX = iX * (this.tileWidth + gap*2) + gap;
					iY = iY * (this.tileHeight + gap*2) + gap;
					
					draw.context.drawImage(
						atlas,
						iX - this.tileOverlay, iY - this.tileOverlay,
						this.tileWidth + this.tileOverlay * 2, // source width
						this.tileHeight + this.tileOverlay * 2, // source height
						x * this.tileWidth - this.tileOverlay, // target x
						y * this.tileHeight - this.tileOverlay, // target y
						this.tileWidth + this.tileOverlay * 2, // target width
						this.tileHeight + this.tileOverlay * 2 // target height
					);
				}
				
			}
		}
	}

}

//
Tilemap.create = generator.functionFromConstructor( Tilemap );

//
export default Tilemap;