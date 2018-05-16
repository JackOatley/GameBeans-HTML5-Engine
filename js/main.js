/**
 * @module main
 */

import canvas from "./canvas.js";
import room from "./room.js";
import input from "./input.js";
import instance from "./instance.js";
import global from "./global.js";
import draw from "./draw.js";
import camera from "./camera.js";

let lastTick = performance.now(),
	tickLength = 1000 / 60,
	dt = 0,
	last = 0;
	
//
let main = {
	
	/**
	 *
	 */
	get dt() {
		return dt;
	},
	
	/**
	 *
	 */
	start: function( opts = {} ) {
		
		// Basic site-locking
		if ( opts.host !== undefined && opts.host !== "" ) {
			let loc = ( window.parent ) ? window.parent.location : window.location;
			let host = loc.hostname;
			let arr = opts.host.split( " " ).join( "" ).split( "," );
			if ( !opts.host.includes( host ) )
				return;
		}
		
		//
		let canv = canvas.create({
			width: room.current.width,
			height: room.current.height,
			crisp2D: true,
			application: true
		});
		
		// selectively enable input methods
		( opts.enableMouse ) && input.initMouse();
		( opts.enableKeyboard ) && input.initKeyboard();
		( opts.enableTouch ) && input.initTouch();
		
		//
		( opts.hideCursor ) && ( canv.style.cursor = "none" );
		
		//
		room.enter( room.current );
		tick( performance.now() );
		
	},
	
	/**
	 *
	 */
	setGameSpeed: function( speed ) {
		tickLength = 1000 / speed;
	}
	
}

/**
 *
 */
function tick( timestamp ) {
	
	// exit game with Esc key
	if ( window._GB_stop && input.triggerEvents.includes("EscapePressed") )
		window._GB_stop();
	
	// request the next frame
	window.requestAnimationFrame( tick );
	let nextTick = lastTick + tickLength;
	let numTicks = 0;
	global.fps = 1000 / (timestamp - last);
	last = timestamp;

	//
	if ( timestamp > nextTick ) {
		let timeSinceTick = timestamp - lastTick;
		numTicks = Math.floor( timeSinceTick / tickLength );
	}
	
	//
	input.getTriggerEvents();
	queueUpdates( numTicks );
	gameDraw();
	
	//
	if ( numTicks ) {
		input.update();
	}
	
}

/**
 *
 */
function queueUpdates( numTicks ) {
	for( var i = 0; i < numTicks; i++ ) {
		lastTick = lastTick + tickLength;
		dt = 1;
		gameUpdate( 1 );
	}
}

/**
 * @param {number} dt Delta Time.
 */
function gameUpdate( dt ) {
	instance.stepAll( dt );
	instance.clearDestroyed();
}

/**
 *
 */
function gameDraw() {
	draw.reset();
	canvas.clear( canvas.main, "#000000" );
	room.draw( room.current );
	camera.update();
	instance.drawAll();
}

/**
 *
 */
function handleResizeEvent() {
	instance.executeEventAll( "resize" );
}

// attach event listerners
window.addEventListener( "resize", handleResizeEvent );

//
export default main;
