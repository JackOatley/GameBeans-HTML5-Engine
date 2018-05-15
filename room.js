/**
 * @module room
 */

//
import instance from "./instance.js";
import sprite from "./sprite.js";
import draw from "./draw.js";
 
//
let room = {
	
	array: [],
	current: null,
	
	/**
	 * @param {string} name
	 * @param {int} width
	 * @param {int} height
	 */
	create: function( name, width, height ) {
		
		let newRoom = {
			name: name,
			assetType: "room",
			width: Number( width ),
			height: Number( height ),
			background: null,
			backgroundMethod: "no-repeat",
			instances: []
		};
		
		if ( room.current === null )
			room.current = newRoom;
		
		room.array.push( newRoom );
		return newRoom;
		
	},

	/**
	 *
	 */
	setBackground: function( rm, spr ) {
		
		rm = room.get( rm );
		rm.background = spr;
		
	},

	/**
	 *
	 */
	addInstance: function( rm, inst, x, y ) {
		
		rm = room.get( rm );
		rm.instances.push( { name: inst, x: x, y: y } );
		
	},

	/**
	 *
	 */
	enter: function( rm ) {
		
		// leave room event
		instance.executeEventAll( "roomleave" );
		
		// clear current instances
		instance.instanceArray.forEach( function( i ) {
			instance.destroy( i, false );
		} );

		// goto new room and create new instances
		rm = room.get( rm );
		room.current = rm;
		rm.instances.forEach( function ( inst ) {
			instance.create( inst.name, inst.x, inst.y );
		} );
		
		// enter room event
		instance.executeEventAll( "roomenter" );

	},

	/**
	 *
	 */
	draw: function( rm ) {

		// draw background
		rm = room.get( rm );
		let spr = sprite.get( rm.background );
		if ( spr !== null ) {
			
			var canvas = draw.getTarget();
			var ctx = canvas.getContext( "2d" );
			let image = spr.images[0].img;
			if ( rm.backgroundMethod === "stretch" ) {
				ctx.drawImage( image, 0, 0, canvas.width, canvas.height );
			} else {
				let ptrn = ctx.createPattern( image, rm.backgroundMethod );
				ctx.fillStyle = ptrn;
				ctx.fillRect( 0, 0, canvas.width, canvas.height );
			}
			
		}

	},
	
	/**
	 *
	 */
	get: function( name ) {
		
		if ( typeof name === "object" )
			return name;
		
		for ( var n = 0; n < room.array.length; n++ )
			if ( room.array[n]["name"] === name )
				return room.array[n];
			
		return null;
			
	}
	
}

//
export default room;
