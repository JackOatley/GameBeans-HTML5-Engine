/**
 * @module input
 */
 
import canvas from "./canvas";
import keyValues from "./keyvalues.js";

let element = document;

// mouse object
let __mouse = {
	pressed: [false, false, false],
	down: [false, false, false],
	released: [false, false, false],
	wheelUp: false,
	wheelDown: false,
	x: 0,
	y: 0
}

// keboard object
let __keyboard = {
	pressed: {},
	down: {},
	released: {}
}

// touch object
let __touch = {
	start: [],
	held: [],
	move: [],
	end: [],
	cancel: [],
	x: [],
	y: []
}

//
let __triggerEvents = [];

//
let input = {
	
	triggerEvents: __triggerEvents,
	mouse: __mouse,
	keyboard: __keyboard,
	touch: __touch,
	
	/**
	 *
	 */
	init: function() {
	
		// init all input methods
		input.initMouse();
		input.initKeyboard();
		input.initTouch();
		
		// disable context menu
		element.addEventListener("contextmenu", function( e ) {
			e.preventDefault();
		});
	
	},
	
	/**
	 *
	 */
	initMouse: function() {
		
		//
		let handleMouseDown = function(e) {
			e.preventDefault();
			( !__mouse.pressed[e.button] ) && window.focus();
			__mouse.pressed[e.button] = true;
			__mouse.down[e.button] = true;
		}
		
		//
		let handleMouseUp = function(e) {
			e.preventDefault();
			__mouse.pressed[e.button] = false;
			__mouse.released[e.button] = true;
			__mouse.down[e.button] = false;
		}
		
		//
		let handleMouseMove = function(e) {
			let canv = canvas.main;
			let rect = canv.getBoundingClientRect();
			__mouse.x = e.clientX - rect.left;
			__mouse.y = e.clientY - rect.top;
		}
		
		//
		let handleMouseWheel = function(e) {
			e.preventDefault();
			let delta = Math.max( -1, Math.min( 1, e.wheelDelta ) );
			__mouse.wheelUp = delta > 0;
			__mouse.wheelDown = delta < 0;
		}
		
		//
		element.addEventListener("mousedown", handleMouseDown);
		element.addEventListener("mouseup", handleMouseUp);
		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mousewheel", handleMouseWheel);
	},
	
	/**
	 *
	 */
	initKeyboard: function() {
		
		//
		keyValues.forEach(function(key) {
			__keyboard.pressed[key] = false;
			__keyboard.down[key] = false;
			__keyboard.released[key] = false;
		});
		
		//
		let handleKeyDown = function(e) {
			e.preventDefault();
			const code = e.code || e.key;
			if ( !__keyboard.down[code] ) {
				__keyboard.pressed[code] = true;
				__keyboard.down[code] = true;
			}
		}
		
		//
		let handleKeyUp = function(e) {
			e.preventDefault();
			const code = e.code || e.key;
			__keyboard.released[code] = true;
			__keyboard.down[code] = false;
		}
		
		//
		element.addEventListener("keydown", handleKeyDown);
		element.addEventListener("keyup", handleKeyUp);
	},
	
	/**
	 *
	 */
	initTouch: function() {
		
		//
		let handleTouchStart = function( e ) {
			e.preventDefault();
			( !__touch.start[0] ) && window.focus();
			__touch.start[0] = true;
			__touch.held[0] = true;
		}
		
		//
		let handleTouchEnd = function( e ) {
			e.preventDefault();
			__touch.start[0] = false;
			__touch.end[0] = true;
			__touch.held[0] = false;
		}
		
		//
		let handleTouchMove = function( e ) {
			e.preventDefault();
			let touches = e.changedTouches;
			__touch.x[0] = touches[0].pageX;
			__touch.y[0] = touches[0].pageY;
		}
		
		//
		element.addEventListener("touchstart", handleTouchStart);
		element.addEventListener("touchend", handleTouchEnd);
		element.addEventListener("touchcancel", handleTouchEnd);
		element.addEventListener("touchmove", handleTouchMove);
	},

	/**
	 *
	 */
	getTriggerEvents: function() {    

		__triggerEvents.length = 0;
		Object.keys( __keyboard.down ).forEach( key => {
			
			if ( keyValues.includes( key ) ) {
			
				if ( __keyboard.down[key] )
					__triggerEvents.push( key );
				
				if ( __keyboard.pressed[key] )
					__triggerEvents.push( key + "Pressed" );
				
				if ( __keyboard.released[key] )
					__triggerEvents.push( key + "Released" );
				
			} else {
				console.warn( "input key not supported: ", key );
				delete __keyboard.down[key];
			}
			
		});
		
		// map mouse ids to names
		let mouseMap = ["Left", "Middle", "Right"];
		
		// mouse events
		for( var n=0; n<3; n++ ) {
			
			if ( __mouse.down[n] )
				__triggerEvents.push( mouseMap[n] + "Down" );
			
			if ( __mouse.pressed[n] )
				__triggerEvents.push( mouseMap[n] + "Pressed" );
			
			if ( __mouse.released[n] )
				__triggerEvents.push( mouseMap[n] + "Released" );
			
		}
		
		if ( __mouse.wheelUp ) __triggerEvents.push( "WheelUp" );
		if ( __mouse.wheelDown ) __triggerEvents.push( "WheelDown" );
		
	},

	/**
	 *
	 */
	update: function() {
		
		Object.keys( __keyboard.down ).forEach( key => {
			__keyboard.pressed[key] = false;
			__keyboard.released[key] = false;
		} );

		Object.keys( __mouse.down ).forEach( button => {
			__mouse.pressed[button] = false;
			__mouse.released[button] = false;
		} );
		
		Object.keys( __touch.held ).forEach( button => {
			__touch.start[button] = false;
			__touch.end[button] = false;
			__touch.held[button] = false;
		} );
		
		__mouse.wheelUp = false;
		__mouse.wheelDown = false;
		
	}
	
}

//
export default input;
