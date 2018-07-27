import color from "./color.js";

//
let aSprites = [],
	aLength = 0;

/**
 *
 */
let sprite = {
	
	//
	names: [],
	array: aSprites,

	/**
	 *
	 */
	create: function( options = {} ) {

		//
		let atlas, atlasIndex;
		if ( options.atlas ) {
			atlasIndex = options.atlasIndex || 0;
			atlas = options.atlas.images[atlasIndex];
		}
		
		//
		let newSprite = {
			assetType: "sprite",
			name: options.name || newSpriteName(),
			originX: options.originX || 0,
			originY: options.originY || 0,
			width: 0,
			height: 0,
			images: []
		}
		
		//
		if ( options.frames ) {
			options.frames.forEach( function( frame ) {
				sprite.addFrame( newSprite, {
					source: frame.src
				});
			} );
		}
		
		//
		sprite.names[aLength] = newSprite.name;
		aSprites[aLength++] = newSprite;
		return newSprite;

	},
	
	/**
	 *
	 */
	addFrame: function( spr, options = {} ) {
		
		spr = sprite.get( spr );
		
		//
		let atlas;
		if ( options.atlas ) {
			atlas = sprite.get( options.atlas ).images[0].img;
		}
		
		let image = {
			img: atlas || new Image(),
			clip: null,
			ready: false
		}
		
		//
		if ( options.source ) {
			
			image.img.onload = function() {
				
				//
				image.clip = {
					x: 0,
					y: 0,
					w: image.img.width,
					h: image.img.height
				}
				
				//
				if ( spr.width * spr.height === 0 ) {
					spr.width = image.clip.w;
					spr.height = image.clip.h;
				}
				
				//
				image.ready = true;
				
			}
			image.img.src = options.source || "";
			
		}
		
		//
		if ( atlas && options.clip ) {
			
			//
			image.clip = options.clip;
			console.log( image.clip );
			
			//
			if ( spr.width * spr.height === 0 ) {
				spr.width = image.clip.w;
				spr.height = image.clip.h;
			}
			
			//
			image.ready = true;
			
		}
		
		//
		spr.images.push( image );
		
	},
	
	/**
	 *
	 */
	cache: function(spr, opts = {}) {
		
		spr = sprite.get( spr );
		spr.images.forEach((frame) => {
			let canvas = document.createElement( "CANVAS" );
			canvas.width = opts.width || frame.img.width;
			canvas.height = opts.height || frame.img.height;
			let ctx = canvas.getContext( "2d" );
			ctx.drawImage( frame.img, 0, 0, canvas.width+1, canvas.height+1 );
			frame.__orig = Object.assign({}, frame);
			frame.clip.x = 0;
			frame.clip.y = 0;
			frame.clip.w = canvas.width;
			frame.clip.h = canvas.height;
			frame.img = canvas;
		});
		
	},
	
	/**
	 *
	 */
	restore: function(spr, options = {}) {
		spr = sprite.get(spr);
		spr.images.forEach((frame) => {
			if (frame.__orig) frame = frame._orig;
			if (frame.__origSrc) frame.img.src = frame.__origSrc;
		});
	},

	/**
	 *
	 */
	setOrigin: function(spr, x, y) {
		spr = sprite.get(spr);
		spr.originX = Number(x);
		spr.originY = Number(y);
	},
	
	/**
	 *
	 */
	readyAll: function() {
		
		for ( var n=0; n<aLength; n++ ) {
			let spr = aSprites[n];
			for ( var i=0; i<spr.images.length; i++ ) {
				let image = spr.images[i];
				if ( !image.ready ) {
					return false;
				}
			}
		}
		
		return true;
		
	},

	/**
	 *
	 */
	tint: function( spr, col ) {
		
		if ( typeof spr !== "object" )
			spr = sprite.get( spr );
		
		//
		spr.images.forEach( function( frame ) {
			
			// create canvas, draw image
			let canvas = document.createElement( "CANVAS" );
			let ctx = canvas.getContext( "2d" );
			canvas.width = spr.width;
			canvas.height = spr.height;
			ctx.drawImage( frame.img, 0, 0 );
			
			// get data, do thing, put data back
			let imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
			pixelDataTint(imageData.data, (typeof col === "object") ? col : color.hexToRgb(col));
			ctx.putImageData( imageData, 0, 0 );
			
			//
			frame.__origSrc = frame.img.src;
			frame.img.src = canvas.toDataURL( "image/png" );
			
		} );
		
	},
	
	/**
	 *
	 */
	get: function(name) {
		
		if (typeof name === "object")
			return name;
		
		for (var n = 0; n < aLength; n++)
			if (aSprites[n].name === name)
				return aSprites[n];
			
		return null;
		
	}
	
}

/**
 *
 */
function newSpriteName() {
	return "Sprite_" + aLength;
}

/**
 *
 */
function pixelDataTint( data, rgb ) {
	
	// cache as much as possible, there could be a lot of pixels
	let l = data.length,
		r = rgb.r / 255,
		g = rgb.g / 255,
		b = rgb.b / 255;
	
	//
	for (var i = 0; i < l; i += 4) {
		data[i]     = r * data[i]     >> 0;
		data[i + 1] = g * data[i + 1] >> 0;
		data[i + 2] = b * data[i + 2] >> 0;
	}
	
}

//
export default sprite;
