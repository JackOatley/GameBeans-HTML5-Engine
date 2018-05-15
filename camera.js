/**
 * @module camera
 */

//
import room from "./room.js";
import draw from "./draw.js";

//
let camera = {
	
	//
	array: [],
	
	/**
	 *
	 */
	create: function( options = {} ) {
	
		// create new camera
		let cam = {
			x: 0,
			y: 0,
			angle: 0,
			width: room.current.width,
			height: room.current.height,
			follow: null,
			gridLocked: false,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		}
		
		// assign options to new camera
		Object.assign( cam, options );
		
		// add to camera list
		camera.array.push( cam );
		return cam;
	
	},
	
	/**
	 *
	 */
	update: function() {
	
		camera.array.forEach( function( cam ) {
			
			// camera is following an instance
			if ( cam.follow !== null ) {
				
				// if single instance, put into array
				if ( !Array.isArray( cam.follow ) ) {
					cam.follow = [cam.follow];
				}
				
				//
				let x = 0,
					y = 0,
					count = 0,
					weight = 1;
				
				cam.follow.forEach( function( inst ) {
					
					if ( Array.isArray( inst ) ) {
						weight = inst[1] || 1;
						inst = inst[0];
					} else {
						weight = 1;
					}
					
					x += inst.x * weight;
					y += inst.y * weight;
					count += weight;
					
				} );
				
				cam.x = x / count;
				cam.y = y / count;
				
			}
			
			// update bounds
			cam.left   = cam.x - cam.width  * 0.5;
			cam.right  = cam.x + cam.width  * 0.5;
			cam.top    = cam.y - cam.height * 0.5;
			cam.bottom = cam.y + cam.height * 0.5;
			
			// apply camera
			draw.transform.translate( -cam.left, -cam.top );
			
		} );
	
	}
	
}

//
export default camera;